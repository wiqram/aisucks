'use client';

import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { gbp } from '@/lib/format';
import { addDays, availability, filterFleet, sortFleet } from '@/lib/pricing';
import type { Bike, Category, FleetFilters, ISODate, Licence, SortKey } from '@/lib/types';
import { ArrowRight, Bolt, CategoryMark, Star } from './Art';
import { BookingSheet } from './BookingSheet';

type FleetProps = {
  fleet: Bike[];
  today: ISODate;
  cities: string[];
  categories: Category[];
  priceFloor: number;
  priceCeiling: number;
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' }
];

export function Fleet({ fleet, today, cities, categories, priceFloor, priceCeiling }: FleetProps) {
  // Defaults are wide open, so the server-rendered HTML contains the whole fleet and
  // hydration changes nothing. Filtering never gates content on JavaScript.
  const [city, setCity] = useState<string>('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [licence, setLicence] = useState<Licence | 'any'>('any');
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [instantOnly, setInstantOnly] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [selected, setSelected] = useState<Bike | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const rangeIsValid = Boolean(from && to) && to >= from;

  const filters: FleetFilters = useMemo(
    () => ({
      city,
      category,
      licence,
      maxPrice,
      instantOnly,
      range: rangeIsValid ? { from, to } : null
    }),
    [city, category, licence, maxPrice, instantOnly, rangeIsValid, from, to]
  );

  // Derived in render, not synced in an effect.
  const visible = useMemo(() => sortFleet(filterFleet(fleet, filters), sort), [fleet, filters, sort]);

  const isFiltered =
    city !== 'all' || category !== 'all' || licence !== 'any' || maxPrice < priceCeiling || instantOnly || rangeIsValid;

  function clearFilters() {
    setCity('all');
    setCategory('all');
    setLicence('any');
    setMaxPrice(priceCeiling);
    setInstantOnly(false);
    setFrom('');
    setTo('');
  }

  function openBike(bike: Bike) {
    setSelected(bike);
    dialogRef.current?.showModal();
  }

  return (
    <section id="fleet" className="border-b border-line">
      <div className="shell py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">The fleet</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
              Bikes released by their owners
            </h2>
            <p className="mt-4 max-w-[34rem] text-mist">
              Every listing is a privately owned bike, free for the dates shown because its owner is away. Pick dates
              to see only what is genuinely free.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="sort" className="label block">
              Sort by
            </label>
            <select
              id="sort"
              className="field mt-2 sm:w-56"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search controls */}
        <div className="plate mt-10 p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="city" className="label block">
                City
              </label>
              <select id="city" className="field mt-2" value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="all">Anywhere in the UK</option>
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="from" className="label block">
                Collect
              </label>
              <input
                id="from"
                type="date"
                className="field mt-2"
                value={from}
                min={today}
                max={addDays(today, 120)}
                onChange={(event) => {
                  setFrom(event.target.value);
                  // Keep the return date sane rather than silently ignoring the range.
                  if (to && event.target.value && to < event.target.value) setTo(event.target.value);
                }}
              />
            </div>

            <div>
              <label htmlFor="to" className="label block">
                Return
              </label>
              <input
                id="to"
                type="date"
                className="field mt-2"
                value={to}
                min={from || today}
                max={addDays(today, 150)}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="maxPrice" className="label flex items-baseline justify-between gap-2">
                <span>Up to</span>
                <span className="num text-sm text-chalk">{`${gbp(maxPrice, { decimals: 0 })}/day`}</span>
              </label>
              <input
                id="maxPrice"
                type="range"
                className="slider mt-4"
                min={priceFloor}
                max={priceCeiling}
                step={1}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-5">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
              <button
                type="button"
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                  category === 'all'
                    ? 'border-signal bg-signal text-ink font-semibold'
                    : 'border-line text-mist hover:border-fog hover:text-chalk'
                )}
              >
                All types
              </button>
              {categories.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  aria-pressed={category === option}
                  className={cn(
                    'rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                    category === option
                      ? 'border-signal bg-signal text-ink font-semibold'
                      : 'border-line text-mist hover:border-fog hover:text-chalk'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist">
                <input
                  type="checkbox"
                  className="size-4 accent-signal"
                  checked={licence === 'A2'}
                  onChange={(event) => setLicence(event.target.checked ? 'A2' : 'any')}
                />
                A2 licence only
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist">
                <input
                  type="checkbox"
                  className="size-4 accent-signal"
                  checked={instantOnly}
                  onChange={(event) => setInstantOnly(event.target.checked)}
                />
                Instant book
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-fog">
            <span className="num text-chalk">{visible.length}</span>
            {isFiltered ? ` of ${fleet.length} bikes match` : ` bikes available`}
            {rangeIsValid ? ' for these dates' : ''}
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-mist underline decoration-line underline-offset-4 transition-colors duration-150 ease-out hover:text-chalk"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <div className="plate mt-6 px-6 py-16 text-center">
            <p className="font-display text-2xl">Nothing free on those terms</p>
            <p className="mx-auto mt-3 max-w-[26rem] text-mist">
              Loosen a filter — widening the dates or the price usually does it. There are {fleet.length} bikes on the
              platform.
            </p>
            <button type="button" onClick={clearFilters} className="btn btn-primary mt-7">
              Clear all filters
            </button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((bike) => (
              <li key={bike.id}>
                <BikeCard bike={bike} today={today} onOpen={() => openBike(bike)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <dialog
        ref={dialogRef}
        // Backdrop click closes, matching every other sheet on the web.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        onClose={() => setSelected(null)}
        className="w-[min(100vw-1.5rem,44rem)] rounded-sm border border-line bg-panel p-0 text-chalk"
      >
        {selected ? (
          <BookingSheet
            bike={selected}
            today={today}
            initialFrom={rangeIsValid ? from : ''}
            initialTo={rangeIsValid ? to : ''}
            onClose={() => dialogRef.current?.close()}
          />
        ) : null}
      </dialog>
    </section>
  );
}

function BikeCard({ bike, today, onOpen }: { bike: Bike; today: ISODate; onOpen: () => void }) {
  const state = availability(bike, today);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="plate group flex h-full w-full flex-col p-5 text-left transition-colors duration-150 ease-out hover:border-fog"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="label">{bike.category}</span>
        {bike.instantBook ? (
          <span className="label flex items-center gap-1 text-signal">
            <Bolt className="size-3" />
            Instant
          </span>
        ) : (
          <span className="label">On request</span>
        )}
      </div>

      <CategoryMark category={bike.category} className="mt-5 h-16 w-32 text-fog/40" />

      <p className="mt-5 text-sm font-semibold tracking-wide text-fog uppercase">{bike.make}</p>
      <h3 className="font-display mt-1 text-2xl leading-tight text-chalk">{bike.model}</h3>

      <p className="num mt-3 text-xs text-fog">
        {bike.year} · {bike.displacement ? `${bike.displacement}cc` : 'Electric'} · {bike.power} bhp · {bike.licence}{' '}
        licence
      </p>

      <p className="mt-4 text-sm text-mist">
        {bike.city} <span className="text-fog">· {bike.pickupArea}</span>
      </p>

      <div className="mt-5 flex items-center gap-1.5 text-sm">
        <Star className="size-3.5 text-signal" />
        <span className="num text-chalk">{bike.rating.toFixed(2)}</span>
        <span className="text-fog">· {bike.trips} trips</span>
        {bike.host.topHost ? <span className="label ml-auto">Top host</span> : null}
      </div>

      {/* mt-auto pins the price block to the bottom so cards align across the row. */}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5">
        <div>
          <p className="num text-2xl font-medium text-signal">
            {gbp(bike.pricePerDay, { decimals: 0 })}
            <span className="text-sm font-normal text-fog"> /day</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span
              aria-hidden="true"
              className={cn(
                'inline-block size-1.5 rounded-full',
                state.state === 'available' ? 'bg-signal' : state.state === 'upcoming' ? 'bg-fog' : 'bg-line'
              )}
            />
            <span className={state.state === 'booked' ? 'text-fog' : 'text-mist'}>{state.label}</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-chalk">
          View
          <ArrowRight className="size-4 text-signal transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
