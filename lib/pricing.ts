// Pricing, availability and earnings rules for Kickstand.
//
// Every function here is pure and dependency-free so the money maths is unit-tested
// directly (`npm test` → tests/pricing.test.ts). Nothing in this file reads the clock:
// "today" is always passed in, which keeps server render and client hydration in
// agreement and makes the tests deterministic.

import type {
  Availability,
  Bike,
  Cover,
  CoverId,
  DateRange,
  Extra,
  ExtraId,
  FleetFilters,
  ISODate,
  Quote,
  QuoteLine,
  SortKey
} from './types';

/** Kickstand's cut of the rider's subtotal. */
export const SERVICE_FEE_RATE = 0.09;

/** Kickstand's commission on a host payout — hosts keep 85%. */
export const HOST_COMMISSION_RATE = 0.15;

/** Share of released days that actually get booked, observed across the fleet.
 *  Used for host earnings estimates so the number isn't a best case. */
export const TYPICAL_OCCUPANCY = 0.62;

/** Mean trip length in days, used to turn booked days into a trip count. */
export const MEAN_TRIP_DAYS = 3.4;

const MS_PER_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Calendar maths
// ---------------------------------------------------------------------------

/** Parse `YYYY-MM-DD` to a UTC timestamp. Throws on malformed input so a bad
 *  query string surfaces as a 400 rather than silently pricing as NaN. */
export function parseDate(iso: ISODate): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`Invalid date: ${iso}`);
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new Error(`Invalid date: ${iso}`);
  return ms;
}

export function toISO(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(parseDate(iso) + days * MS_PER_DAY);
}

/** Whole calendar days from `from` to `to`. Negative if `to` precedes `from`. */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseDate(to) - parseDate(from)) / MS_PER_DAY);
}

/** Billable days for a rental. Collecting and returning on the same date is one
 *  day, not zero — riders are charged for possession, not for overnights. */
export function rentalDays(from: ISODate, to: ISODate): number {
  return Math.max(1, daysBetween(from, to));
}

/** True when two inclusive ranges share at least one calendar day. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return parseDate(a.from) <= parseDate(b.to) && parseDate(b.from) <= parseDate(a.to);
}

/** True when `inner` sits entirely within `outer` (inclusive bounds). */
export function rangeContains(outer: DateRange, inner: DateRange): boolean {
  return parseDate(inner.from) >= parseDate(outer.from) && parseDate(inner.to) <= parseDate(outer.to);
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/** A bike is bookable for a range only if the owner released the whole range AND
 *  no existing booking touches it. Both halves matter: the first is the owner's
 *  consent, the second is physical reality. */
export function isAvailableFor(bike: Bike, range: DateRange): boolean {
  if (parseDate(range.to) < parseDate(range.from)) return false;
  if (!rangeContains(bike.listed, range)) return false;
  return !bike.booked.some((b) => rangesOverlap(b, range));
}

/** Next date from `today` onwards on which the bike is free, or null if its
 *  listing window has passed. */
export function nextFreeDate(bike: Bike, today: ISODate): ISODate | null {
  const start = Math.max(parseDate(today), parseDate(bike.listed.from));
  const end = parseDate(bike.listed.to);
  for (let ms = start; ms <= end; ms += MS_PER_DAY) {
    const day = toISO(ms);
    if (!bike.booked.some((b) => rangesOverlap(b, { from: day, to: day }))) return day;
  }
  return null;
}

/** Human-readable badge for a card: free right now, free later, or fully booked. */
export function availability(bike: Bike, today: ISODate): Availability {
  const free = nextFreeDate(bike, today);
  if (!free) return { state: 'booked', label: 'Fully booked' };
  if (free === today) return { state: 'available', label: 'Available today' };
  const inDays = daysBetween(today, free);
  if (inDays <= 2) return { state: 'available', label: `Available ${formatShort(free)}` };
  return { state: 'upcoming', label: `Available from ${formatShort(free)}` };
}

/** `18 Aug` — short, unambiguous, and identical on server and client because it
 *  never touches the host locale. */
export function formatShort(iso: ISODate): string {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

// ---------------------------------------------------------------------------
// Cover and extras
// ---------------------------------------------------------------------------

/** Insurance tiers. Essential is bundled into every rental so a bike is never on
 *  the road uninsured — the paid tiers only buy the excess down. */
export const COVERS: Cover[] = [
  {
    id: 'essential',
    name: 'Essential',
    perDay: 0,
    excess: 1500,
    summary: 'Included with every rental, at no cost.',
    includes: [
      '£2m third-party liability',
      'Theft and fire',
      'UK-wide roadside recovery',
      'Rider accident cover to £10,000'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    perDay: 14,
    excess: 500,
    summary: 'Cuts your damage liability by two thirds.',
    includes: [
      'Everything in Essential',
      'Accidental damage to the bike',
      'Tyres, wheels and brake discs',
      'Personal effects to £250'
    ]
  },
  {
    id: 'zero',
    name: 'Zero Excess',
    perDay: 29,
    excess: 0,
    summary: 'Hand the keys back and walk away.',
    includes: [
      'Everything in Standard',
      'No excess on any claim',
      'Helmet and riding gear to £750',
      'Key replacement',
      'Europe extension, 14 days'
    ]
  }
];

export const EXTRAS: Extra[] = [
  { id: 'helmet', name: 'Helmet and gloves', detail: 'Sanitised, ECE 22.06, your size', price: 8, unit: 'day' },
  { id: 'luggage', name: 'Panniers or top box', detail: 'Fitted and locked to the bike', price: 11, unit: 'day' },
  { id: 'comms', name: 'Intercom headset', detail: 'Cardo pair, charged, paired', price: 6, unit: 'day' },
  { id: 'delivery', name: 'Delivery and collection', detail: 'To any address within 15 miles', price: 39, unit: 'once' }
];

export function findCover(id: CoverId): Cover {
  const cover = COVERS.find((c) => c.id === id);
  if (!cover) throw new Error(`Unknown cover: ${id}`);
  return cover;
}

export function findExtra(id: ExtraId): Extra {
  const extra = EXTRAS.find((e) => e.id === id);
  if (!extra) throw new Error(`Unknown extra: ${id}`);
  return extra;
}

// ---------------------------------------------------------------------------
// Quoting
// ---------------------------------------------------------------------------

/** Round to pence. Every line is rounded before it is summed, so the printed
 *  breakdown always adds up to the printed total — no half-penny drift. */
export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Long-stay rate that applies to a given trip length. */
export function discountRateFor(bike: Pick<Bike, 'weeklyDiscount' | 'monthlyDiscount'>, days: number): number {
  if (days >= 28) return bike.monthlyDiscount;
  if (days >= 7) return bike.weeklyDiscount;
  return 0;
}

export type QuoteInput = {
  bike: Pick<
    Bike,
    'pricePerDay' | 'weeklyDiscount' | 'monthlyDiscount' | 'deposit' | 'milesPerDay' | 'make' | 'model'
  >;
  from: ISODate;
  to: ISODate;
  cover: CoverId;
  extras: ExtraId[];
};

/** Build the itemised quote a rider sees before booking. */
export function buildQuote({ bike, from, to, cover, extras }: QuoteInput): Quote {
  const days = rentalDays(from, to);
  const cover_ = findCover(cover);
  const lines: QuoteLine[] = [];

  const base = money(bike.pricePerDay * days);
  lines.push({
    label: `£${bike.pricePerDay} × ${days} ${days === 1 ? 'day' : 'days'}`,
    detail: `${bike.make} ${bike.model}`,
    amount: base
  });

  const rate = discountRateFor(bike, days);
  const savings = money(base * rate);
  if (savings > 0) {
    lines.push({
      label: days >= 28 ? 'Monthly rate' : 'Weekly rate',
      detail: `${Math.round(rate * 100)}% off the daily price`,
      amount: savings,
      credit: true
    });
  }

  const coverCost = money(cover_.perDay * days);
  lines.push({
    label: `${cover_.name} cover`,
    detail: cover_.perDay === 0 ? 'Included' : `£${cover_.perDay}/day · £${cover_.excess} excess`,
    amount: coverCost
  });

  // De-duplicate so a repeated id in a query string can't be billed twice.
  let extrasCost = 0;
  for (const id of [...new Set(extras)]) {
    const extra = findExtra(id);
    const amount = money(extra.unit === 'day' ? extra.price * days : extra.price);
    extrasCost += amount;
    lines.push({
      label: extra.name,
      detail: extra.unit === 'day' ? `£${extra.price}/day` : 'One-off',
      amount
    });
  }

  const subtotal = money(base - savings + coverCost + extrasCost);
  const serviceFee = money(subtotal * SERVICE_FEE_RATE);
  const total = money(subtotal + serviceFee);

  return {
    days,
    lines,
    subtotal,
    serviceFee,
    total,
    perDay: money(total / days),
    deposit: bike.deposit,
    savings,
    milesIncluded: bike.milesPerDay * days
  };
}

// ---------------------------------------------------------------------------
// Host earnings
// ---------------------------------------------------------------------------

export type EarningsInput = {
  pricePerDay: number;
  /** Days per month the host is willing to release the bike. */
  daysReleased: number;
  occupancy?: number;
};

export type Earnings = {
  bookedDays: number;
  gross: number;
  commission: number;
  net: number;
  perYear: number;
  trips: number;
};

/** What a host can expect to clear. Deliberately built on observed occupancy
 *  rather than assuming every released day sells. */
export function estimateEarnings({ pricePerDay, daysReleased, occupancy = TYPICAL_OCCUPANCY }: EarningsInput): Earnings {
  const days = Math.max(0, Math.min(30, daysReleased));
  const bookedDays = Math.round(days * occupancy);
  const gross = money(bookedDays * pricePerDay);
  const commission = money(gross * HOST_COMMISSION_RATE);
  const net = money(gross - commission);
  return {
    bookedDays,
    gross,
    commission,
    net,
    perYear: money(net * 12),
    trips: bookedDays === 0 ? 0 : Math.max(1, Math.round(bookedDays / MEAN_TRIP_DAYS))
  };
}

// ---------------------------------------------------------------------------
// Autopilot — automated pricing
// ---------------------------------------------------------------------------

/** Cities where demand consistently runs above or below the national baseline. */
const CITY_DEMAND: Record<string, number> = {
  London: 1.14,
  Brighton: 1.18,
  Edinburgh: 1.12,
  Manchester: 1.05,
  Bristol: 1.02,
  Leeds: 0.98,
  Birmingham: 0.97,
  Glasgow: 1.0
};

/** Riding season demand by month index (0 = Jan). Ride-outs peak in summer;
 *  midwinter demand is thin and priced to move. */
const SEASON_DEMAND = [0.82, 0.84, 0.94, 1.06, 1.16, 1.24, 1.28, 1.26, 1.14, 1.0, 0.88, 0.85];

/** Annual mean of the season curve. Deviations are measured against this, not
 *  against 1.0, so an average month leaves the price alone. */
const SEASON_MEAN = SEASON_DEMAND.reduce((sum, value) => sum + value, 0) / SEASON_DEMAND.length;

/** A typical week is 2 weekend days in 7. */
const BASELINE_WEEKEND_SHARE = 2 / 7;

// How much of each raw signal is allowed through to the price. These exist because
// a host's standing rate ALREADY prices in their city and roughly the season —
// applying the raw multipliers on top compounds them and produces the sort of
// +60% suggestion no owner would ever accept.
const CITY_WEIGHT = 0.3;
const SEASON_WEIGHT = 0.5;
const WEEKEND_WEIGHT = 0.18;

/** Autopilot never moves a host's rate further than this in either direction
 *  without being asked. A visible ceiling is what makes automated pricing
 *  something an owner will actually leave switched on. */
export const AUTOPILOT_MAX_ADJUSTMENT = 0.3;

/** Fraction of the trip that falls on a Saturday or Sunday. */
export function weekendShare(from: ISODate, to: ISODate): number {
  const days = rentalDays(from, to);
  let weekend = 0;
  for (let i = 0; i < days; i += 1) {
    const dow = new Date(parseDate(addDays(from, i))).getUTCDay();
    if (dow === 0 || dow === 6) weekend += 1;
  }
  return weekend / days;
}

export type Suggestion = {
  price: number;
  /** Percentage change against the host's standing daily rate. */
  deltaPct: number;
  reasons: string[];
};

/** The price Autopilot would set for a specific bike and window.
 *
 *  The host's standing rate is the baseline; each signal contributes only its
 *  *deviation* from normal, damped by the weights above. An average week in an
 *  average city therefore leaves the rate untouched, and a peak-summer weekend in
 *  a busy city lands around +25% rather than absurdly higher.
 *
 *  Three signals, all explainable to the host: where the bike is, what time of
 *  year it is, and how much of the window is weekend. Hosts are told *why* the
 *  number moved, and can always override it. */
export function autopilotPrice(
  bike: Pick<Bike, 'pricePerDay' | 'city' | 'category'>,
  range: DateRange
): Suggestion {
  const reasons: string[] = [];

  const cityDemand = CITY_DEMAND[bike.city] ?? 1;
  const cityAdjustment = 1 + (cityDemand - 1) * CITY_WEIGHT;
  if (cityDemand >= 1.1) reasons.push(`${bike.city} demand runs above the national average`);
  else if (cityDemand < 1) reasons.push(`${bike.city} demand is soft, so the price stays keen`);

  const month = Number(range.from.slice(5, 7)) - 1;
  const season = SEASON_DEMAND[month] ?? SEASON_MEAN;
  const seasonAdjustment = 1 + (season / SEASON_MEAN - 1) * SEASON_WEIGHT;
  if (season >= 1.15) reasons.push('Peak riding season');
  else if (season <= 0.9) reasons.push('Off-season — priced to fill the calendar');

  const weekend = weekendShare(range.from, range.to);
  const weekendAdjustment = 1 + (weekend - BASELINE_WEEKEND_SHARE) * WEEKEND_WEIGHT;
  if (weekend >= 0.5) reasons.push('Mostly weekend days, which book fastest');
  else if (weekend === 0) reasons.push('Midweek dates, which take longer to fill');

  // Adventure bikes hold their price through the summer touring season.
  const shape = bike.category === 'Adventure' && season > 1.1 ? 1.04 : 1;
  if (shape > 1) reasons.push('Touring bikes are in demand for multi-day trips');

  const raw = bike.pricePerDay * cityAdjustment * seasonAdjustment * weekendAdjustment * shape;
  const ceiling = bike.pricePerDay * (1 + AUTOPILOT_MAX_ADJUSTMENT);
  const floor = bike.pricePerDay * (1 - AUTOPILOT_MAX_ADJUSTMENT);
  if (raw > ceiling || raw < floor) {
    reasons.push(`Held at the ${Math.round(AUTOPILOT_MAX_ADJUSTMENT * 100)}% limit you set`);
  }

  const price = Math.round(Math.min(Math.max(raw, floor), ceiling));
  const deltaPct = Math.round(((price - bike.pricePerDay) / bike.pricePerDay) * 100);
  return { price, deltaPct, reasons };
}

// ---------------------------------------------------------------------------
// Fleet filtering and sorting
// ---------------------------------------------------------------------------

export function filterFleet(fleet: Bike[], filters: FleetFilters): Bike[] {
  return fleet.filter((bike) => {
    if (filters.city !== 'all' && bike.city !== filters.city) return false;
    if (filters.category !== 'all' && bike.category !== filters.category) return false;
    // An A licence covers A2 machines, so an A2 filter is a ceiling, not an equality.
    if (filters.licence === 'A2' && bike.licence !== 'A2') return false;
    if (bike.pricePerDay > filters.maxPrice) return false;
    if (filters.instantOnly && !bike.instantBook) return false;
    if (filters.range && !isAvailableFor(bike, filters.range)) return false;
    return true;
  });
}

export function sortFleet(fleet: Bike[], key: SortKey): Bike[] {
  const sorted = [...fleet];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case 'price-desc':
      return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating || b.trips - a.trips);
    default:
      // Recommended = well-reviewed and well-used, with instant-book breaking ties.
      return sorted.sort(
        (a, b) =>
          b.rating * Math.log10(b.trips + 1) - a.rating * Math.log10(a.trips + 1) ||
          Number(b.instantBook) - Number(a.instantBook)
      );
  }
}

/** Reference shown on a confirmed booking. Derived from the inputs rather than
 *  random so the same request always reads back the same — and so the server and
 *  a retry can't disagree about which booking they're talking about. */
export function bookingReference(bikeId: string, from: ISODate, to: ISODate): string {
  const seed = `${bikeId}|${from}|${to}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 1_679_616;
  return `KS-${hash.toString(36).toUpperCase().padStart(4, '0')}`;
}
