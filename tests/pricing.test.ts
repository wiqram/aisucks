// Unit tests for the pricing, availability and earnings rules.
// Run with `npm test` — Node's built-in runner strips the types, so there is no
// test framework dependency to install or keep current.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  AUTOPILOT_MAX_ADJUSTMENT,
  COVERS,
  EXTRAS,
  HOST_COMMISSION_RATE,
  SERVICE_FEE_RATE,
  addDays,
  autopilotPrice,
  availability,
  bookingReference,
  buildQuote,
  daysBetween,
  discountRateFor,
  estimateEarnings,
  filterFleet,
  formatShort,
  isAvailableFor,
  money,
  nextFreeDate,
  parseDate,
  rangeContains,
  rangesOverlap,
  rentalDays,
  sortFleet,
  weekendShare
} from '../lib/pricing.ts';
import type { Bike, FleetFilters } from '../lib/types.ts';

const TODAY = '2026-08-12';

/** Minimal bike used for the pricing arithmetic — round numbers so the expected
 *  values below can be checked by hand. */
const TEST_BIKE = {
  pricePerDay: 100,
  weeklyDiscount: 0.1,
  monthlyDiscount: 0.2,
  deposit: 500,
  milesPerDay: 150,
  make: 'Test',
  model: 'Bike'
};

function bike(overrides: Partial<Bike> = {}): Bike {
  return {
    id: 'x1',
    make: 'Yamaha',
    model: 'MT-07',
    year: 2022,
    category: 'Naked',
    displacement: 689,
    power: 72,
    weight: 184,
    seatHeight: 805,
    licence: 'A',
    city: 'Leeds',
    pickupArea: 'Holbeck',
    pricePerDay: 58,
    weeklyDiscount: 0.15,
    monthlyDiscount: 0.3,
    deposit: 300,
    milesPerDay: 150,
    extraMileRate: 0.3,
    rating: 4.9,
    trips: 68,
    instantBook: true,
    host: { name: 'Sam K.', since: 2021, topHost: true },
    listed: { from: '2026-08-10', to: '2026-09-20' },
    booked: [],
    included: [],
    note: '',
    ...overrides
  };
}

describe('calendar maths', () => {
  test('rejects malformed dates rather than pricing NaN', () => {
    assert.throws(() => parseDate('12/08/2026'), /Invalid date/);
    assert.throws(() => parseDate('2026-8-1'), /Invalid date/);
    assert.throws(() => parseDate(''), /Invalid date/);
  });

  test('addDays crosses month and year boundaries', () => {
    assert.equal(addDays('2026-08-30', 3), '2026-09-02');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-08-12', -13), '2026-07-30');
  });

  test('addDays is unaffected by BST — the maths is UTC throughout', () => {
    // 26 Oct 2026 is the UK clock change. A local-time implementation drifts here.
    assert.equal(addDays('2026-10-24', 3), '2026-10-27');
    assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2);
  });

  test('a same-day rental is billed as one day, not zero', () => {
    assert.equal(daysBetween('2026-08-12', '2026-08-12'), 0);
    assert.equal(rentalDays('2026-08-12', '2026-08-12'), 1);
    assert.equal(rentalDays('2026-08-12', '2026-08-15'), 3);
  });

  test('formatShort is locale-independent', () => {
    assert.equal(formatShort('2026-08-12'), '12 Aug');
    assert.equal(formatShort('2026-01-01'), '1 Jan');
    assert.equal(formatShort('2026-12-25'), '25 Dec');
  });
});

describe('range overlap', () => {
  test('touching ranges overlap — a bike cannot be in two places on one day', () => {
    assert.equal(rangesOverlap({ from: '2026-08-01', to: '2026-08-05' }, { from: '2026-08-05', to: '2026-08-09' }), true);
  });

  test('adjacent-but-separate ranges do not overlap', () => {
    assert.equal(rangesOverlap({ from: '2026-08-01', to: '2026-08-04' }, { from: '2026-08-05', to: '2026-08-09' }), false);
  });

  test('containment is inclusive at both bounds', () => {
    const outer = { from: '2026-08-01', to: '2026-08-31' };
    assert.equal(rangeContains(outer, { from: '2026-08-01', to: '2026-08-31' }), true);
    assert.equal(rangeContains(outer, { from: '2026-07-31', to: '2026-08-10' }), false);
    assert.equal(rangeContains(outer, { from: '2026-08-20', to: '2026-09-01' }), false);
  });
});

describe('availability', () => {
  test('free when inside the released window with no clash', () => {
    assert.equal(isAvailableFor(bike(), { from: '2026-08-14', to: '2026-08-18' }), true);
  });

  test('not free outside the released window, even by one day', () => {
    assert.equal(isAvailableFor(bike(), { from: '2026-08-09', to: '2026-08-12' }), false);
    assert.equal(isAvailableFor(bike(), { from: '2026-09-19', to: '2026-09-21' }), false);
  });

  test('not free when it clashes with an existing booking', () => {
    const b = bike({ booked: [{ from: '2026-08-15', to: '2026-08-18' }] });
    assert.equal(isAvailableFor(b, { from: '2026-08-17', to: '2026-08-20' }), false, 'overlaps the tail');
    assert.equal(isAvailableFor(b, { from: '2026-08-13', to: '2026-08-15' }), false, 'overlaps the head');
    assert.equal(isAvailableFor(b, { from: '2026-08-16', to: '2026-08-17' }), false, 'sits inside');
    assert.equal(isAvailableFor(b, { from: '2026-08-19', to: '2026-08-22' }), true, 'starts after');
  });

  test('a backwards range is never bookable', () => {
    assert.equal(isAvailableFor(bike(), { from: '2026-08-20', to: '2026-08-14' }), false);
  });

  test('nextFreeDate skips over booked days', () => {
    const b = bike({ booked: [{ from: '2026-08-12', to: '2026-08-14' }] });
    assert.equal(nextFreeDate(b, TODAY), '2026-08-15');
  });

  test('nextFreeDate is null when the whole window is gone', () => {
    const b = bike({ listed: { from: '2026-08-12', to: '2026-08-14' }, booked: [{ from: '2026-08-12', to: '2026-08-14' }] });
    assert.equal(nextFreeDate(b, TODAY), null);
    assert.deepEqual(availability(b, TODAY), { state: 'booked', label: 'Fully booked' });
  });

  test('badge distinguishes today, imminent and later', () => {
    assert.equal(availability(bike(), TODAY).label, 'Available today');
    assert.equal(availability(bike(), TODAY).state, 'available');

    const soon = bike({ booked: [{ from: '2026-08-12', to: '2026-08-13' }] });
    assert.equal(availability(soon, TODAY).state, 'available', 'within two days still counts as available');

    const later = bike({ listed: { from: '2026-08-20', to: '2026-09-20' } });
    assert.deepEqual(availability(later, TODAY), { state: 'upcoming', label: 'Available from 20 Aug' });
  });
});

describe('quoting', () => {
  test('rounds to whole pence', () => {
    assert.equal(money(74.0700000001), 74.07);
    assert.equal(money(0.005), 0.01);
    assert.equal(money(1 / 3), 0.33);
  });

  test('long-stay rate switches at exactly 7 and 28 days', () => {
    assert.equal(discountRateFor(TEST_BIKE, 6), 0);
    assert.equal(discountRateFor(TEST_BIKE, 7), 0.1);
    assert.equal(discountRateFor(TEST_BIKE, 27), 0.1);
    assert.equal(discountRateFor(TEST_BIKE, 28), 0.2);
  });

  test('a short trip on bundled cover', () => {
    const quote = buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-15', cover: 'essential', extras: [] });
    assert.equal(quote.days, 3);
    assert.equal(quote.savings, 0);
    assert.equal(quote.subtotal, 300);
    assert.equal(quote.serviceFee, 27);
    assert.equal(quote.total, 327);
    assert.equal(quote.perDay, 109);
    assert.equal(quote.deposit, 500);
    assert.equal(quote.milesIncluded, 450);
  });

  test('a week with paid cover, a per-day extra and a one-off extra', () => {
    const quote = buildQuote({
      bike: TEST_BIKE,
      from: '2026-08-12',
      to: '2026-08-19',
      cover: 'standard',
      extras: ['helmet', 'delivery']
    });
    // base 700 − 70 weekly + 98 cover + 56 helmet + 39 delivery = 823
    assert.equal(quote.days, 7);
    assert.equal(quote.savings, 70);
    assert.equal(quote.subtotal, 823);
    assert.equal(quote.serviceFee, 74.07);
    assert.equal(quote.total, 897.07);
    assert.equal(quote.perDay, 128.15);
  });

  test('a one-off extra does not scale with trip length', () => {
    const short = buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-14', cover: 'essential', extras: ['delivery'] });
    const long = buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-26', cover: 'essential', extras: ['delivery'] });
    const lineOf = (q: typeof short) => q.lines.find((l) => l.label === 'Delivery and collection')?.amount;
    assert.equal(lineOf(short), 39);
    assert.equal(lineOf(long), 39);
  });

  test('the printed lines always add up to the printed subtotal', () => {
    for (const days of [1, 3, 7, 14, 28, 45]) {
      for (const cover of COVERS.map((c) => c.id)) {
        const quote = buildQuote({
          bike: TEST_BIKE,
          from: '2026-08-12',
          to: addDays('2026-08-12', days),
          cover,
          extras: EXTRAS.map((e) => e.id)
        });
        const summed = quote.lines.reduce((total, line) => total + (line.credit ? -line.amount : line.amount), 0);
        assert.equal(money(summed), quote.subtotal, `lines must reconcile for ${days} days on ${cover}`);
        assert.equal(money(quote.subtotal + quote.serviceFee), quote.total);
      }
    }
  });

  test('the service fee is 9% of the subtotal', () => {
    const quote = buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-22', cover: 'zero', extras: [] });
    assert.equal(quote.serviceFee, money(quote.subtotal * SERVICE_FEE_RATE));
  });

  test('a duplicated extra is billed once', () => {
    const once = buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-15', cover: 'essential', extras: ['helmet'] });
    const twice = buildQuote({
      bike: TEST_BIKE,
      from: '2026-08-12',
      to: '2026-08-15',
      cover: 'essential',
      extras: ['helmet', 'helmet', 'helmet']
    });
    assert.equal(twice.total, once.total);
  });

  test('paid cover costs more but buys the excess down', () => {
    const totals = COVERS.map(
      (c) => buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-15', cover: c.id, extras: [] }).total
    );
    assert.deepEqual([...totals].sort((a, b) => a - b), totals, 'tiers must be ordered cheapest first');
    assert.equal(COVERS[0].excess > COVERS[2].excess, true);
    assert.equal(COVERS[2].excess, 0);
  });

  test('unknown cover or extra is rejected, not silently ignored', () => {
    // @ts-expect-error deliberately invalid input
    assert.throws(() => buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-13', cover: 'gold', extras: [] }));
    // @ts-expect-error deliberately invalid input
    assert.throws(() => buildQuote({ bike: TEST_BIKE, from: '2026-08-12', to: '2026-08-13', cover: 'essential', extras: ['tank'] }));
  });
});

describe('host earnings', () => {
  test('takes 15% commission and clears the rest', () => {
    const earnings = estimateEarnings({ pricePerDay: 100, daysReleased: 10, occupancy: 0.6 });
    assert.equal(earnings.bookedDays, 6);
    assert.equal(earnings.gross, 600);
    assert.equal(earnings.commission, 90);
    assert.equal(earnings.net, 510);
    assert.equal(earnings.perYear, 6120);
    assert.equal(earnings.commission, money(earnings.gross * HOST_COMMISSION_RATE));
  });

  test('never assumes every released day sells', () => {
    const earnings = estimateEarnings({ pricePerDay: 100, daysReleased: 30 });
    assert.equal(earnings.bookedDays < 30, true);
  });

  test('clamps to a real month and copes with zero', () => {
    assert.equal(estimateEarnings({ pricePerDay: 100, daysReleased: 90 }).bookedDays, estimateEarnings({ pricePerDay: 100, daysReleased: 30 }).bookedDays);
    const none = estimateEarnings({ pricePerDay: 100, daysReleased: 0 });
    assert.equal(none.net, 0);
    assert.equal(none.trips, 0);
  });

  test('more released days never earns less', () => {
    let previous = -1;
    for (let days = 0; days <= 30; days += 1) {
      const { net } = estimateEarnings({ pricePerDay: 80, daysReleased: days });
      assert.equal(net >= previous, true, `net dipped at ${days} days`);
      previous = net;
    }
  });
});

describe('autopilot pricing', () => {
  test('is deterministic — the same inputs always give the same price', () => {
    const input = { pricePerDay: 100, city: 'London', category: 'Naked' as const };
    const range = { from: '2026-08-14', to: '2026-08-16' };
    assert.deepEqual(autopilotPrice(input, range), autopilotPrice(input, range));
  });

  test('prices a high-demand city above a soft one', () => {
    const range = { from: '2026-07-10', to: '2026-07-13' };
    const brighton = autopilotPrice({ pricePerDay: 100, city: 'Brighton', category: 'Naked' }, range);
    const birmingham = autopilotPrice({ pricePerDay: 100, city: 'Birmingham', category: 'Naked' }, range);
    assert.equal(brighton.price > birmingham.price, true);
  });

  test('summer prices above midwinter', () => {
    const july = autopilotPrice({ pricePerDay: 100, city: 'Bristol', category: 'Naked' }, { from: '2026-07-10', to: '2026-07-13' });
    const january = autopilotPrice({ pricePerDay: 100, city: 'Bristol', category: 'Naked' }, { from: '2027-01-10', to: '2027-01-13' });
    assert.equal(july.price > january.price, true);
    assert.equal(january.deltaPct < 0, true, 'off-season should discount below the standing rate');
  });

  test('always explains itself', () => {
    const suggestion = autopilotPrice({ pricePerDay: 100, city: 'London', category: 'Adventure' }, { from: '2026-08-14', to: '2026-08-17' });
    assert.equal(suggestion.reasons.length > 0, true);
    assert.equal(
      suggestion.reasons.every((reason) => typeof reason === 'string' && reason.length > 0),
      true
    );
  });

  test('an average week in an average city leaves the rate alone', () => {
    // October sits closest to the annual mean; a Mon–Sun window has the baseline
    // weekend density. Glasgow is the neutral city. Nothing should move much.
    const suggestion = autopilotPrice({ pricePerDay: 100, city: 'Glasgow', category: 'Naked' }, { from: '2026-10-05', to: '2026-10-12' });
    assert.equal(Math.abs(suggestion.deltaPct) <= 5, true, `moved ${suggestion.deltaPct}% on a neutral week`);
  });

  test('never moves a host rate beyond the published cap', () => {
    // Regression guard: stacking raw city × season × weekend multipliers once
    // produced +58% suggestions, which no owner would leave switched on.
    const cities = ['London', 'Brighton', 'Edinburgh', 'Manchester', 'Bristol', 'Leeds', 'Birmingham', 'Glasgow'];
    const categories = ['Sport', 'Naked', 'Adventure', 'Classic', 'Cruiser', 'Electric'] as const;
    const starts = Array.from({ length: 24 }, (_, i) => addDays('2026-01-01', i * 15));

    for (const city of cities) {
      for (const category of categories) {
        for (const start of starts) {
          for (const length of [1, 2, 3, 7, 14]) {
            const suggestion = autopilotPrice(
              { pricePerDay: 100, city, category },
              { from: start, to: addDays(start, length) }
            );
            assert.equal(
              Math.abs(suggestion.deltaPct) <= AUTOPILOT_MAX_ADJUSTMENT * 100,
              true,
              `${city}/${category}/${start}/${length}d moved ${suggestion.deltaPct}%`
            );
            assert.equal(suggestion.price > 0, true);
          }
        }
      }
    }
  });

  test('weekend share is measured, not guessed', () => {
    // Find a real Saturday without reusing the implementation's arithmetic.
    let saturday = '2026-08-12';
    for (let i = 0; i < 7; i += 1) {
      const candidate = addDays('2026-08-12', i);
      if (new Date(`${candidate}T00:00:00Z`).getUTCDay() === 6) {
        saturday = candidate;
        break;
      }
    }
    assert.equal(weekendShare(saturday, saturday), 1, 'a single Saturday is all weekend');
    assert.equal(weekendShare(addDays(saturday, 2), addDays(saturday, 2)), 0, 'the Monday after is not');
    assert.equal(weekendShare(saturday, addDays(saturday, 7)), 2 / 7, 'a full week holds exactly two weekend days');
  });
});

describe('fleet filtering and sorting', () => {
  const fleet = [
    bike({ id: 'a', city: 'London', category: 'Sport', licence: 'A', pricePerDay: 90, instantBook: true, rating: 4.8, trips: 10 }),
    bike({ id: 'b', city: 'Leeds', category: 'Adventure', licence: 'A2', pricePerDay: 50, instantBook: false, rating: 4.9, trips: 40 }),
    bike({ id: 'c', city: 'London', category: 'Adventure', licence: 'A', pricePerDay: 70, instantBook: true, rating: 5.0, trips: 2 })
  ];

  const base: FleetFilters = { city: 'all', category: 'all', licence: 'any', maxPrice: 1000, range: null, instantOnly: false };
  const ids = (list: Bike[]) => list.map((b) => b.id);

  test('no filters keeps the whole fleet', () => {
    assert.deepEqual(ids(filterFleet(fleet, base)), ['a', 'b', 'c']);
  });

  test('filters by city, category, price and instant book', () => {
    assert.deepEqual(ids(filterFleet(fleet, { ...base, city: 'London' })), ['a', 'c']);
    assert.deepEqual(ids(filterFleet(fleet, { ...base, category: 'Adventure' })), ['b', 'c']);
    assert.deepEqual(ids(filterFleet(fleet, { ...base, maxPrice: 70 })), ['b', 'c']);
    assert.deepEqual(ids(filterFleet(fleet, { ...base, instantOnly: true })), ['a', 'c']);
  });

  test('the A2 filter keeps only A2-legal bikes', () => {
    assert.deepEqual(ids(filterFleet(fleet, { ...base, licence: 'A2' })), ['b']);
  });

  test('filters compose', () => {
    assert.deepEqual(ids(filterFleet(fleet, { ...base, city: 'London', category: 'Adventure', maxPrice: 80 })), ['c']);
    assert.deepEqual(ids(filterFleet(fleet, { ...base, city: 'Leeds', instantOnly: true })), []);
  });

  test('a date range excludes anything already booked', () => {
    const withBooking = [
      bike({ id: 'free' }),
      bike({ id: 'taken', booked: [{ from: '2026-08-15', to: '2026-08-20' }] })
    ];
    const range = { from: '2026-08-16', to: '2026-08-18' };
    assert.deepEqual(ids(filterFleet(withBooking, { ...base, range })), ['free']);
  });

  test('sorts by price and rating', () => {
    assert.deepEqual(ids(sortFleet(fleet, 'price-asc')), ['b', 'c', 'a']);
    assert.deepEqual(ids(sortFleet(fleet, 'price-desc')), ['a', 'c', 'b']);
    assert.deepEqual(ids(sortFleet(fleet, 'rating')), ['c', 'b', 'a']);
  });

  test('recommended favours proven listings over a perfect score on two trips', () => {
    assert.equal(sortFleet(fleet, 'recommended')[0].id, 'b');
  });

  test('sorting does not mutate the input', () => {
    const before = ids(fleet);
    sortFleet(fleet, 'price-desc');
    assert.deepEqual(ids(fleet), before);
  });
});

describe('booking reference', () => {
  test('is stable for the same trip and differs across trips', () => {
    const a = bookingReference('mt-07', '2026-08-14', '2026-08-18');
    assert.equal(a, bookingReference('mt-07', '2026-08-14', '2026-08-18'));
    assert.notEqual(a, bookingReference('mt-07', '2026-08-15', '2026-08-18'));
    assert.notEqual(a, bookingReference('cb500x', '2026-08-14', '2026-08-18'));
  });

  test('looks like a reference a human can read out', () => {
    assert.match(bookingReference('mt-07', '2026-08-14', '2026-08-18'), /^KS-[0-9A-Z]{4}$/);
  });
});
