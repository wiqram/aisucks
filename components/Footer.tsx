import { CITIES } from '@/lib/bikes';
import { ArrowRight, WheelMark } from './Art';

export function Footer() {
  return (
    <footer className="bg-ink">
      {/* Closing call to action */}
      <div className="shell py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-line pb-12">
          <h2 className="font-display max-w-[30rem] text-[clamp(2rem,5vw,3.5rem)] leading-[0.95]">
            Someone within ten miles wants to ride your bike this weekend
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href="#host" className="btn btn-primary">
              Work out what mine earns
              <ArrowRight className="size-4" />
            </a>
            <a href="#fleet" className="btn btn-ghost">
              Browse the fleet
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <WheelMark className="size-6 text-signal" />
              <span className="font-display text-xl leading-none">Kickstand</span>
            </div>
            <p className="mt-4 max-w-[24rem] text-sm text-fog">
              Peer-to-peer motorcycle rental. Owners release the days they aren&rsquo;t riding; we handle the cover, the
              licence checks and the agreement.
            </p>
          </div>

          <nav aria-label="Cities">
            <p className="label">Live cities</p>
            <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-mist">
              {CITIES.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site sections">
            <p className="label">On this page</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { href: '#fleet', label: 'Browse bikes' },
                { href: '#how', label: 'How it works' },
                { href: '#cover', label: 'Insurance cover' },
                { href: '#legal', label: 'Legal and compliance' },
                { href: '#autopilot', label: 'Autopilot pricing' },
                { href: '#host', label: 'Earnings calculator' },
                { href: '#faq', label: 'Questions' }
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-mist transition-colors duration-150 ease-out hover:text-chalk">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="text-xs text-fog">
            Kickstand is a concept demo. Listings, hosts and prices are illustrative, bookings are simulated, and no
            payment is ever taken.
          </p>
          <p className="num text-xs text-fog">aisucks.qcguy.com</p>
        </div>
      </div>
    </footer>
  );
}
