// Domain types for Kickstand — peer-to-peer motorcycle rental.
//
// Deliberately framework-free so the pricing/availability rules in lib/pricing.ts
// can be unit-tested with `node --test` without pulling in React or Next.

/** ISO calendar date, `YYYY-MM-DD`. All date maths is UTC-based and calendar-day
 *  accurate — a rental never shifts because the renderer sits in another zone. */
export type ISODate = string;

/** Inclusive calendar range: a bike listed `from` 1 Sep `to` 3 Sep covers all three days. */
export type DateRange = { from: ISODate; to: ISODate };

export type Category = 'Sport' | 'Naked' | 'Adventure' | 'Classic' | 'Cruiser' | 'Electric';

/** UK licence categories. A2 is the restricted (35 kW) licence most riders hold first. */
export type Licence = 'A' | 'A2';

export type Host = {
  name: string;
  /** Year they listed their first bike. */
  since: number;
  /** Kickstand's top host tier: >20 trips, 4.9+, zero cancellations. */
  topHost: boolean;
};

export type Bike = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: Category;
  /** Engine capacity in cc. `null` for electric bikes, which quote kW instead. */
  displacement: number | null;
  /** Peak power in bhp. */
  power: number;
  /** Kerb weight in kg. */
  weight: number;
  /** Seat height in mm — the single spec riders ask about most. */
  seatHeight: number;
  licence: Licence;
  city: string;
  /** Neighbourhood shown before booking; the exact address is released on confirmation. */
  pickupArea: string;
  pricePerDay: number;
  /** Fraction off for 7+ day rentals, e.g. 0.15 = 15%. */
  weeklyDiscount: number;
  /** Fraction off for 28+ day rentals. */
  monthlyDiscount: number;
  /** Card pre-authorisation held during the trip, never charged unless there's damage. */
  deposit: number;
  milesPerDay: number;
  extraMileRate: number;
  rating: number;
  trips: number;
  /** Book without waiting for the host to approve. */
  instantBook: boolean;
  host: Host;
  /** The window the owner has released the bike for — usually while they're away. */
  listed: DateRange;
  /** Ranges already taken by other riders. */
  booked: DateRange[];
  /** Included kit, no extra charge. */
  included: string[];
  /** One line from the host, in their own voice. */
  note: string;
};

export type CoverId = 'essential' | 'standard' | 'zero';

export type Cover = {
  id: CoverId;
  name: string;
  /** Added cost per rental day, in GBP. Essential is bundled at £0. */
  perDay: number;
  /** Rider's maximum liability for damage, in GBP. */
  excess: number;
  summary: string;
  includes: string[];
};

export type ExtraId = 'helmet' | 'luggage' | 'comms' | 'delivery';

export type Extra = {
  id: ExtraId;
  name: string;
  detail: string;
  price: number;
  /** `day` bills per rental day; `once` is a flat fee for the trip. */
  unit: 'day' | 'once';
};

export type QuoteLine = {
  label: string;
  detail?: string;
  amount: number;
  /** Rendered as a credit (e.g. multi-day discount). */
  credit?: boolean;
};

export type Quote = {
  days: number;
  lines: QuoteLine[];
  /** Everything the rider owes before the Kickstand service fee. */
  subtotal: number;
  serviceFee: number;
  total: number;
  /** Blended all-in cost per day — the number riders actually compare. */
  perDay: number;
  /** Held as a pre-auth, not part of `total`. */
  deposit: number;
  /** Amount knocked off by the weekly/monthly rate. */
  savings: number;
  milesIncluded: number;
};

export type AvailabilityState = 'available' | 'upcoming' | 'booked';

export type Availability = {
  state: AvailabilityState;
  label: string;
};

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export type FleetFilters = {
  city: string | 'all';
  category: Category | 'all';
  licence: Licence | 'any';
  maxPrice: number;
  /** When set, only bikes free for the whole range are kept. */
  range: DateRange | null;
  instantOnly: boolean;
};
