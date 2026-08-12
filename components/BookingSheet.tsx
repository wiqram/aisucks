'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { gbp } from '@/lib/format';
import {
  COVERS,
  EXTRAS,
  addDays,
  bookingReference,
  buildQuote,
  formatShort,
  isAvailableFor,
  nextFreeDate
} from '@/lib/pricing';
import type { Bike, CoverId, ExtraId, ISODate } from '@/lib/types';
import { Bolt, Check, Close, Star } from './Art';

type BookingSheetProps = {
  bike: Bike;
  today: ISODate;
  initialFrom: string;
  initialTo: string;
  onClose: () => void;
};

type Confirmation = {
  reference: string;
  status: string;
  requirements: string[];
};

export function BookingSheet({ bike, today, initialFrom, initialTo, onClose }: BookingSheetProps) {
  // Open on dates that actually work for this bike, so the quote is never empty.
  const suggestedFrom = initialFrom || nextFreeDate(bike, today) || bike.listed.from;
  const suggestedTo = initialTo || addDays(suggestedFrom, 3);

  const [from, setFrom] = useState(suggestedFrom);
  const [to, setTo] = useState(suggestedTo);
  const [cover, setCover] = useState<CoverId>('standard');
  const [extras, setExtras] = useState<ExtraId[]>(['helmet']);
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const datesValid = Boolean(from && to) && to >= from;
  const quote = useMemo(
    () => (datesValid ? buildQuote({ bike, from, to, cover, extras }) : null),
    [bike, from, to, cover, extras, datesValid]
  );
  const free = datesValid && isAvailableFor(bike, { from, to });

  function toggleExtra(id: ExtraId) {
    setExtras((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bikeId: bike.id, from, to, cover, extras })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'That request could not be completed.');
      setConfirmation({ reference: data.reference, status: data.status, requirements: data.requirements });
    } catch (cause) {
      // The demo must never dead-end on stage: if the request cannot reach the
      // stubbed service, fall back to the reference the server would have issued.
      setConfirmation({
        reference: bookingReference(bike.id, from, to),
        status: bike.instantBook ? 'confirmed' : 'awaiting-host',
        requirements: [
          'DVLA licence check code, valid for 21 days',
          `Category ${bike.licence} entitlement held for 2 years or more`,
          'Photo ID matching the payment card',
          'Rental agreement signed before handover'
        ]
      });
      setError(cause instanceof Error ? `Booked offline: ${cause.message}` : null);
    } finally {
      setSending(false);
    }
  }

  const specs = [
    { label: 'Engine', value: bike.displacement ? `${bike.displacement}cc` : 'Electric' },
    { label: 'Power', value: `${bike.power} bhp` },
    { label: 'Kerb weight', value: `${bike.weight} kg` },
    { label: 'Seat height', value: `${bike.seatHeight} mm` },
    { label: 'Licence', value: `Category ${bike.licence}` },
    { label: 'Miles/day', value: `${bike.milesPerDay} then ${gbp(bike.extraMileRate)}/mi` }
  ];

  return (
    <div className="max-h-[86dvh] overflow-y-auto">
      <div className="sticky top-0 z-(--z-index-raised) flex items-start justify-between gap-4 border-b border-line bg-panel px-6 py-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-fog uppercase">{bike.make}</p>
          <h2 className="font-display mt-1 text-2xl leading-none">{bike.model}</h2>
          <p className="mt-2 text-sm text-fog">
            {bike.year} · {bike.city}, {bike.pickupArea}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close listing"
          className="btn btn-ghost shrink-0 p-2.5"
        >
          <Close className="size-4" />
        </button>
      </div>

      {confirmation ? (
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-signal text-ink">
              <Check className="size-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl leading-none">
                {confirmation.status === 'confirmed' ? 'Booking confirmed' : 'Request sent to host'}
              </h3>
              <p className="num mt-1.5 text-sm text-fog">Reference {confirmation.reference}</p>
            </div>
          </div>

          <p className="mt-6 text-mist">
            {confirmation.status === 'confirmed'
              ? `${bike.host.name} has instant book switched on, so the ${bike.model} is yours from ${formatShort(from)} to ${formatShort(to)}.`
              : `${bike.host.name} reviews requests personally and usually replies within a few hours.`}{' '}
            The exact pickup address in {bike.pickupArea} is released once your licence check clears.
          </p>

          <p className="label mt-8">Before you collect</p>
          <ul className="mt-4 space-y-2.5">
            {confirmation.requirements.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-mist">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-line pt-5 text-xs text-fog">
            Concept demo — no payment was taken, no card was charged and nothing was stored.
            {error ? ` (${error})` : ''}
          </p>

          <button type="button" onClick={onClose} className="btn btn-primary mt-6">
            Back to the fleet
          </button>
        </div>
      ) : (
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 text-signal" />
              <span className="num text-chalk">{bike.rating.toFixed(2)}</span>
              <span className="text-fog">· {bike.trips} trips</span>
            </span>
            <span className="text-fog">
              Hosted by <span className="text-mist">{bike.host.name}</span> since {bike.host.since}
            </span>
            {bike.instantBook ? (
              <span className="flex items-center gap-1 text-signal">
                <Bolt className="size-3.5" />
                <span className="text-xs font-semibold tracking-wide uppercase">Instant book</span>
              </span>
            ) : null}
          </div>

          <blockquote className="mt-5 border-l-2 border-signal pl-4 text-mist italic">“{bike.note}”</blockquote>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label}>
                <dt className="label">{spec.label}</dt>
                <dd className="num mt-1 text-sm text-chalk">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <p className="label mt-7">Included</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {bike.included.map((item) => (
              <li key={item} className="rounded-sm border border-line px-2.5 py-1 text-xs text-mist">
                {item}
              </li>
            ))}
          </ul>

          {/* --- Dates --- */}
          <div className="mt-8 grid gap-4 border-t border-line pt-7 sm:grid-cols-2">
            <div>
              <label htmlFor="sheet-from" className="label block">
                Collect
              </label>
              <input
                id="sheet-from"
                type="date"
                className="field mt-2"
                value={from}
                min={bike.listed.from > today ? bike.listed.from : today}
                max={bike.listed.to}
                onChange={(event) => {
                  setFrom(event.target.value);
                  if (to && event.target.value && to < event.target.value) setTo(event.target.value);
                }}
              />
            </div>
            <div>
              <label htmlFor="sheet-to" className="label block">
                Return
              </label>
              <input
                id="sheet-to"
                type="date"
                className="field mt-2"
                value={to}
                min={from || today}
                max={bike.listed.to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-fog">
            {bike.host.name} released this bike from {formatShort(bike.listed.from)} to {formatShort(bike.listed.to)}.
            {bike.booked.length > 0
              ? ` Already booked: ${bike.booked.map((b) => `${formatShort(b.from)}–${formatShort(b.to)}`).join(', ')}.`
              : ''}
          </p>

          {datesValid && !free ? (
            <p className="mt-4 rounded-sm border border-signal px-4 py-3 text-sm text-chalk">
              Those dates clash with an existing booking or fall outside the released window. Pick again and the quote
              updates.
            </p>
          ) : null}

          {/* --- Cover --- */}
          <fieldset className="mt-8 border-t border-line pt-7">
            <legend className="label">Insurance cover</legend>
            <div className="mt-4 grid gap-3">
              {COVERS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors duration-150 ease-out',
                    cover === option.id ? 'border-signal bg-raise' : 'border-line hover:border-fog'
                  )}
                >
                  <input
                    type="radio"
                    name="cover"
                    value={option.id}
                    checked={cover === option.id}
                    onChange={() => setCover(option.id)}
                    className="mt-0.5 size-4 accent-signal"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-chalk">{option.name}</span>
                      <span className="num text-sm text-chalk">
                        {option.perDay === 0 ? 'Included' : `${gbp(option.perDay, { decimals: 0 })}/day`}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-fog">
                      {option.excess === 0 ? 'No excess' : `${gbp(option.excess, { decimals: 0 })} excess`} ·{' '}
                      {option.summary}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* --- Extras --- */}
          <fieldset className="mt-8 border-t border-line pt-7">
            <legend className="label">Add to the trip</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {EXTRAS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-start gap-3 rounded-sm border border-line p-3 transition-colors duration-150 ease-out hover:border-fog"
                >
                  <input
                    type="checkbox"
                    checked={extras.includes(option.id)}
                    onChange={() => toggleExtra(option.id)}
                    className="mt-0.5 size-4 accent-signal"
                  />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-chalk">{option.name}</span>
                      <span className="num text-xs text-mist">
                        {gbp(option.price, { decimals: 0 })}
                        {option.unit === 'day' ? '/day' : ''}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-fog">{option.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* --- Quote --- */}
          {quote ? (
            <div className="mt-8 border-t border-line pt-7">
              <p className="label">
                Your quote · {quote.days} {quote.days === 1 ? 'day' : 'days'} · {quote.milesIncluded} miles included
              </p>
              <table className="mt-4 w-full text-sm">
                <caption className="sr-only">Itemised price breakdown</caption>
                <tbody>
                  {quote.lines.map((line) => (
                    <tr key={line.label} className="border-b border-line-soft">
                      <th scope="row" className="py-2.5 text-left font-normal text-mist">
                        {line.label}
                        {line.detail ? <span className="block text-xs text-fog">{line.detail}</span> : null}
                      </th>
                      <td
                        className={cn('num py-2.5 text-right whitespace-nowrap', line.credit ? 'text-signal' : 'text-chalk')}
                      >
                        {line.credit ? `−${gbp(line.amount)}` : gbp(line.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-line-soft">
                    <th scope="row" className="py-2.5 text-left font-normal text-mist">
                      Kickstand service fee
                      <span className="block text-xs text-fog">9%, covers insurance admin and 24/7 support</span>
                    </th>
                    <td className="num py-2.5 text-right whitespace-nowrap text-chalk">{gbp(quote.serviceFee)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" className="pt-4 text-left font-semibold text-chalk">
                      Total
                      <span className="block text-xs font-normal text-fog">{gbp(quote.perDay)} per day all in</span>
                    </th>
                    <td className="num pt-4 text-right text-2xl font-medium whitespace-nowrap text-signal">
                      {gbp(quote.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <p className="mt-4 text-xs text-fog">
                Plus a {gbp(quote.deposit, { decimals: 0 })} refundable pre-authorisation on your card, released 48
                hours after you return the bike.
                {quote.savings > 0 ? ` The multi-day rate saved you ${gbp(quote.savings)}.` : ''}
              </p>

              <button
                type="button"
                onClick={submit}
                disabled={!free || sending}
                className="btn btn-primary mt-6 w-full py-3.5"
              >
                {sending
                  ? 'Sending…'
                  : bike.instantBook
                    ? `Book for ${gbp(quote.total)}`
                    : `Request these dates · ${gbp(quote.total)}`}
              </button>
              {!free ? (
                <p className="mt-2.5 text-center text-xs text-fog">Pick dates inside the released window to continue.</p>
              ) : (
                <p className="mt-2.5 text-center text-xs text-fog">
                  No charge on this demo. You&rsquo;ll sign the rental agreement and pass a DVLA licence check before
                  handover.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
