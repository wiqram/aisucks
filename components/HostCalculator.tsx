'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { gbp, gbpRound } from '@/lib/format';
import { HOST_COMMISSION_RATE, estimateEarnings } from '@/lib/pricing';
import type { Category } from '@/lib/types';
import { Check } from './Art';

type ClassRate = { category: Category; rate: number };

const DEMAND_LEVELS = [
  { id: 'quiet', label: 'Quiet city', occupancy: 0.45 },
  { id: 'typical', label: 'Typical', occupancy: 0.62 },
  { id: 'busy', label: 'Busy summer', occupancy: 0.8 }
] as const;

export function HostCalculator({ classRates }: { classRates: ClassRate[] }) {
  const [category, setCategory] = useState<Category>(classRates[0]?.category ?? 'Naked');
  const [daysReleased, setDaysReleased] = useState(12);
  const [level, setLevel] = useState<(typeof DEMAND_LEVELS)[number]['id']>('typical');

  const rate = classRates.find((entry) => entry.category === category)?.rate ?? 60;
  const occupancy = DEMAND_LEVELS.find((entry) => entry.id === level)?.occupancy ?? 0.62;

  const earnings = useMemo(
    () => estimateEarnings({ pricePerDay: rate, daysReleased, occupancy }),
    [rate, daysReleased, occupancy]
  );

  return (
    <section id="host" className="border-b border-line bg-panel">
      <div className="shell py-16 md:py-20">
        <div className="max-w-[42rem]">
          <p className="label">Earn from yours</p>
          <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
            A garaged bike is a depreciating asset
          </h2>
          <p className="mt-5 text-lg text-mist">
            The average privately owned motorcycle in the UK is ridden fewer than 40 days a year. Insurance, tax and
            depreciation run all 365. Release the days you aren&rsquo;t using and the bike covers its own keep.
          </p>
        </div>

        <div className="mt-12 grid gap-x-14 gap-y-10 lg:grid-cols-[1fr_1fr]">
          {/* Controls */}
          <div>
            <fieldset>
              <legend className="label">What do you ride?</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {classRates.map((entry) => (
                  <button
                    key={entry.category}
                    type="button"
                    onClick={() => setCategory(entry.category)}
                    aria-pressed={category === entry.category}
                    className={cn(
                      'rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                      category === entry.category
                        ? 'border-signal bg-signal font-semibold text-ink'
                        : 'border-line text-mist hover:border-fog hover:text-chalk'
                    )}
                  >
                    {entry.category}
                  </button>
                ))}
              </div>
              <p className="num mt-3 text-xs text-fog">
                Typical rate on Kickstand: {gbp(rate, { decimals: 0 })}/day
              </p>
            </fieldset>

            <div className="mt-9">
              <label htmlFor="days" className="label flex items-baseline justify-between gap-2">
                <span>Days a month you don&rsquo;t need it</span>
                <span className="num text-sm text-chalk">{daysReleased} days</span>
              </label>
              <input
                id="days"
                type="range"
                className="slider mt-4"
                min={1}
                max={30}
                step={1}
                value={daysReleased}
                onChange={(event) => setDaysReleased(Number(event.target.value))}
              />
              <div className="num mt-2 flex justify-between text-xs text-fog">
                <span>1</span>
                <span>30</span>
              </div>
            </div>

            <fieldset className="mt-9">
              <legend className="label">How busy is your city?</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {DEMAND_LEVELS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setLevel(entry.id)}
                    aria-pressed={level === entry.id}
                    className={cn(
                      'rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                      level === entry.id
                        ? 'border-signal bg-signal font-semibold text-ink'
                        : 'border-line text-mist hover:border-fog hover:text-chalk'
                    )}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
              <p className="num mt-3 text-xs text-fog">{Math.round(occupancy * 100)}% of released days get booked</p>
            </fieldset>

            <div className="mt-10 border-t border-line pt-8">
              <p className="label">Out of your hands</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  'Insurance arranged per trip',
                  'Rider licence and ID checks',
                  'The rental agreement',
                  'Damage claims and disputes',
                  'Payment collection',
                  'Roadside recovery, 24/7'
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-mist">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Result */}
          <div className="plate p-6 md:p-8">
            <p className="label">You&rsquo;d clear, after our cut</p>
            <p
              className="num mt-3 text-[clamp(2.75rem,8vw,4.5rem)] leading-none font-medium text-signal"
              // Announce the recalculated figure to screen readers as the sliders move.
              aria-live="polite"
            >
              {gbpRound(earnings.net)}
              <span className="text-lg font-normal text-fog"> /month</span>
            </p>

            <dl className="mt-8 divide-y divide-line border-t border-line">
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-mist">Days booked of {daysReleased} released</dt>
                <dd className="num text-sm text-chalk">{earnings.bookedDays}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-mist">Trips a month, roughly</dt>
                <dd className="num text-sm text-chalk">{earnings.trips}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-mist">Rental income</dt>
                <dd className="num text-sm text-chalk">{gbp(earnings.gross)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-mist">
                  Kickstand commission
                  <span className="block text-xs text-fog">
                    {Math.round(HOST_COMMISSION_RATE * 100)}%, includes the insurance
                  </span>
                </dt>
                <dd className="num text-sm text-fog">−{gbp(earnings.commission)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="font-semibold text-chalk">Over a year</dt>
                <dd className="num text-lg font-medium text-chalk">{gbpRound(earnings.perYear)}</dd>
              </div>
            </dl>

            <p className="mt-6 text-xs text-fog">
              An estimate, not a promise: built on {Math.round(occupancy * 100)}% occupancy and the typical rate for a{' '}
              {category.toLowerCase()} bike. Your insurance, tax and MOT stay your responsibility; the rental cover sits
              on top for the duration of each trip.
            </p>
            <a href="#how" className="btn btn-ghost mt-6 w-full">
              See how listing works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
