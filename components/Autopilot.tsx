import { gbp } from '@/lib/format';
import { AUTOPILOT_MAX_ADJUSTMENT, addDays, autopilotPrice, formatShort, parseDate } from '@/lib/pricing';
import type { Bike, ISODate } from '@/lib/types';

const SCREENING = [
  'Licence category and years held, straight from the DVLA record',
  'Endorsements, with IN and DR codes declined automatically',
  'Engine size stepped to experience — no 1250 on a two-year licence',
  'ID matched to the payment card, and the card pre-authorised',
  'Previous Kickstand trips, cancellations and owner reviews'
];

/** Next Friday from `today`, so the worked example always sits on a weekend. */
function nextFriday(today: ISODate): ISODate {
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = addDays(today, offset);
    if (new Date(parseDate(day)).getUTCDay() === 5) return day;
  }
  return addDays(today, 7);
}

export function Autopilot({ fleet, today }: { fleet: Bike[]; today: ISODate }) {
  const from = nextFriday(today);
  const to = addDays(from, 2);

  // Three listings in different cities, so the city signal is visible in the output.
  const examples = ['monster-937', 'cb500x', 'r1250gsa']
    .map((id) => fleet.find((bike) => bike.id === id))
    .filter((bike): bike is Bike => Boolean(bike))
    .map((bike) => ({ bike, suggestion: autopilotPrice(bike, { from, to }) }));

  const headline = examples[0];

  return (
    <section id="autopilot" className="border-b border-line">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="label">Autopilot</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
              It rents itself while you&rsquo;re away
            </h2>
            <p className="mt-5 text-lg text-mist">
              Set the dates you don&rsquo;t need the bike and stop thinking about it. Autopilot prices each day against
              local demand, the season and how much of the window falls on a weekend, then screens every rider before
              the request ever reaches you.
            </p>
            <p className="mt-4 text-mist">
              It always shows its working, and you can override any price or decline any rider. It is arithmetic on
              demand signals, not a black box — and it is the reason a bike listed on Kickstand fills roughly 62% of the
              days it is offered.
            </p>

            <p className="label mt-10">Every rider is checked for</p>
            <ul className="mt-4 space-y-3">
              {SCREENING.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-mist">
                  <span aria-hidden="true" className="mt-2 inline-block size-1 shrink-0 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="plate p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="label">Suggested rates</p>
              <p className="num text-xs text-fog">
                {formatShort(from)} – {formatShort(to)} · 3 nights
              </p>
            </div>

            <ul className="mt-6 divide-y divide-line">
              {examples.map(({ bike, suggestion }) => (
                <li key={bike.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-chalk">
                      {bike.make} {bike.model}
                    </p>
                    <p className="num mt-1 text-xs text-fog">
                      {bike.city} · standing rate {gbp(bike.pricePerDay, { decimals: 0 })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num text-xl font-medium text-signal">{gbp(suggestion.price, { decimals: 0 })}</p>
                    <p className="num mt-0.5 text-xs text-fog">
                      {suggestion.deltaPct >= 0 ? '+' : ''}
                      {suggestion.deltaPct}% per day
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {headline ? (
              <div className="mt-6 border-t border-line pt-6">
                <p className="label">
                  Why the {headline.bike.model} moved {headline.suggestion.deltaPct >= 0 ? 'up' : 'down'}
                </p>
                <ul className="mt-3 space-y-2">
                  {headline.suggestion.reasons.map((reason) => (
                    <li key={reason} className="text-sm text-mist">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-6 border-t border-line pt-5 text-xs text-fog">
              Recalculated every morning against live demand, and never moved more than{' '}
              {Math.round(AUTOPILOT_MAX_ADJUSTMENT * 100)}% either side of your own rate. Set a floor, set a ceiling, or
              ignore it entirely and price by hand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
