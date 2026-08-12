import { CITIES, FLEET_SIZE, PRICE_FLOOR } from '@/lib/bikes';
import { ArrowRight, Shield, WheelDrawing } from './Art';

const PROMISES = [
  { title: '£2m cover, every trip', detail: 'Bundled in, not an upsell' },
  { title: 'DVLA licence checks', detail: 'Entitlement verified before handover' },
  { title: 'UK-wide recovery', detail: '24/7, included as standard' },
  { title: 'Payouts in 48 hours', detail: 'Hosts keep 85% of the rate' }
];

export function Hero({ topHosts }: { topHosts: number }) {
  const stats = [
    { value: String(FLEET_SIZE), label: 'bikes listed' },
    { value: String(CITIES.length), label: 'cities' },
    { value: `£${PRICE_FLOOR}`, label: 'cheapest per day' },
    { value: String(topHosts), label: 'top-rated hosts' }
  ];

  return (
    // Above the fold: rendered visible, never wrapped in an entrance animation.
    <section id="top" className="relative overflow-hidden border-b border-line">
      <WheelDrawing className="pointer-events-none absolute -top-24 -right-40 hidden w-[38rem] text-line md:block lg:-right-24 lg:w-[46rem]" />

      <div className="shell relative pt-16 pb-14 md:pt-24 md:pb-20">
        <p className="label flex items-center gap-2">
          <span className="inline-block h-px w-8 bg-signal" aria-hidden="true" />
          Motorcycle rental, owner to rider
        </p>

        <h1 className="font-display mt-6 max-w-[46rem] text-[clamp(2.5rem,7.4vw,5.5rem)] leading-[0.92]">
          Your bike shouldn&rsquo;t spend the summer on its kickstand
        </h1>

        <p className="mt-7 max-w-[38rem] text-lg leading-relaxed text-mist">
          Rent a motorcycle from the person who actually owns it. Or list yours while you&rsquo;re away and let it
          earn instead of depreciating in the garage. Insurance, licence checks and the rental agreement are handled
          on every single trip.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href="#fleet" className="btn btn-primary">
            Browse {FLEET_SIZE} bikes
            <ArrowRight className="size-4" />
          </a>
          <a href="#host" className="btn btn-ghost">
            Work out what mine earns
          </a>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="label">{stat.label}</dt>
              <dd className="num mt-1.5 text-3xl font-medium text-chalk">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-line bg-panel">
        <ul className="shell grid gap-x-8 gap-y-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((promise) => (
            <li key={promise.title} className="flex items-start gap-3">
              <Shield className="mt-0.5 size-4 shrink-0 text-signal" />
              <div>
                <p className="text-sm font-semibold text-chalk">{promise.title}</p>
                <p className="mt-0.5 text-sm text-fog">{promise.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
