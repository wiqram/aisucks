// Data-integrity tests for the fleet.
//
// The listings are hand-written, so these guard against the mistakes hand-written
// data actually makes: a duplicated id, a booking outside the released window, an
// A2 listing that is not A2-legal, or a category with no bikes in it (which would
// leave the host calculator quoting a rate nothing charges).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, CITIES, FLEET_SIZE, PRICE_CEILING, PRICE_FLOOR, getBike, getFleet } from '../lib/bikes.ts';
import { rangeContains, rangesOverlap } from '../lib/pricing.ts';

const TODAY = '2026-08-12';
const fleet = getFleet(TODAY);

describe('fleet shape', () => {
  test('resolves every seed', () => {
    assert.equal(fleet.length, FLEET_SIZE);
    assert.equal(FLEET_SIZE >= 12, true, 'the grid needs enough listings to look like a marketplace');
  });

  test('ids are unique — React keys and the booking API both rely on it', () => {
    const ids = fleet.map((bike) => bike.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('getBike finds a listing and returns undefined for nonsense', () => {
    assert.equal(getBike(TODAY, 'mt-07')?.model, 'MT-07');
    assert.equal(getBike(TODAY, 'no-such-bike'), undefined);
  });
});

describe('listing windows', () => {
  test('are resolved relative to the day asked for, so nothing goes stale', () => {
    const later = getFleet('2027-03-01');
    for (const [index, bike] of fleet.entries()) {
      assert.notEqual(bike.listed.from, later[index].listed.from);
      assert.equal(later[index].listed.from >= '2027-02-01', true);
    }
  });

  test('run forwards', () => {
    for (const bike of fleet) {
      assert.equal(bike.listed.to > bike.listed.from, true, `${bike.id} has a backwards window`);
    }
  });

  test('every existing booking sits inside the released window', () => {
    for (const bike of fleet) {
      for (const booking of bike.booked) {
        assert.equal(booking.to >= booking.from, true, `${bike.id} has a backwards booking`);
        assert.equal(rangeContains(bike.listed, booking), true, `${bike.id} is booked outside its window`);
      }
    }
  });

  test('a bike is never double-booked', () => {
    for (const bike of fleet) {
      for (let i = 0; i < bike.booked.length; i += 1) {
        for (let j = i + 1; j < bike.booked.length; j += 1) {
          assert.equal(rangesOverlap(bike.booked[i], bike.booked[j]), false, `${bike.id} has clashing bookings`);
        }
      }
    }
  });
});

describe('listing content', () => {
  test('prices sit within the advertised bounds', () => {
    for (const bike of fleet) {
      assert.equal(bike.pricePerDay >= PRICE_FLOOR, true, `${bike.id} is below the floor`);
      assert.equal(bike.pricePerDay <= PRICE_CEILING, true, `${bike.id} is above the ceiling`);
    }
    assert.equal(Math.min(...fleet.map((b) => b.pricePerDay)), PRICE_FLOOR);
    assert.equal(Math.max(...fleet.map((b) => b.pricePerDay)), PRICE_CEILING);
  });

  test('the monthly rate always beats the weekly rate', () => {
    for (const bike of fleet) {
      assert.equal(bike.monthlyDiscount > bike.weeklyDiscount, true, `${bike.id} has a pointless monthly rate`);
      assert.equal(bike.weeklyDiscount > 0 && bike.monthlyDiscount < 1, true);
    }
  });

  test('A2 listings are genuinely A2-legal at 47 bhp or less', () => {
    for (const bike of fleet.filter((b) => b.licence === 'A2')) {
      assert.equal(bike.power <= 47, true, `${bike.id} is marked A2 but makes ${bike.power} bhp`);
    }
  });

  test('every listing carries the specs a rider decides on', () => {
    for (const bike of fleet) {
      assert.equal(bike.power > 0, true, `${bike.id} has no power figure`);
      assert.equal(bike.weight > 100, true, `${bike.id} has an implausible weight`);
      assert.equal(bike.seatHeight > 600 && bike.seatHeight < 1000, true, `${bike.id} has an implausible seat height`);
      assert.equal(bike.milesPerDay > 0, true, `${bike.id} has no mileage allowance`);
      assert.equal(bike.deposit > 0, true, `${bike.id} has no deposit`);
      assert.equal(bike.note.length > 20, true, `${bike.id} has no host note`);
      assert.equal(bike.included.length > 0, true, `${bike.id} lists no included kit`);
      // Electric bikes quote kW, not cc.
      if (bike.category === 'Electric') assert.equal(bike.displacement, null);
      else assert.equal(typeof bike.displacement, 'number');
    }
  });

  test('ratings and trip counts are plausible', () => {
    for (const bike of fleet) {
      assert.equal(bike.rating >= 4 && bike.rating <= 5, true, `${bike.id} has an odd rating`);
      assert.equal(bike.trips > 0, true, `${bike.id} has no trips`);
      // Top-host status has published criteria; the data must honour them.
      if (bike.host.topHost) assert.equal(bike.rating >= 4.85 && bike.trips >= 20, true, `${bike.id} is not really a top host`);
    }
  });
});

describe('derived catalogues', () => {
  test('CITIES covers exactly the cities in the fleet', () => {
    assert.deepEqual(CITIES, [...new Set(fleet.map((b) => b.city))].sort());
    assert.equal(CITIES.length >= 6, true);
  });

  test('every advertised category has at least one bike', () => {
    for (const category of CATEGORIES) {
      assert.equal(fleet.some((bike) => bike.category === category), true, `no bikes in ${category}`);
    }
  });

  test('no bike sits in a category the filters do not offer', () => {
    for (const bike of fleet) {
      assert.equal(CATEGORIES.includes(bike.category), true, `${bike.id} is in unlisted category ${bike.category}`);
    }
  });

  test('there is something to rent on any given day', () => {
    const availableToday = fleet.filter((bike) => bike.listed.from <= TODAY && bike.listed.to >= TODAY);
    assert.equal(availableToday.length >= 5, true, 'the grid would look empty on day one');
  });

  test('both instant-book and on-request listings exist', () => {
    assert.equal(fleet.some((b) => b.instantBook), true);
    assert.equal(fleet.some((b) => !b.instantBook), true);
  });
});
