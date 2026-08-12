import { CATEGORIES, CITIES, FLEET_SIZE, PRICE_CEILING, PRICE_FLOOR, getFleet } from '@/lib/bikes';
import { today } from '@/lib/today';
import type { Category } from '@/lib/types';
import { Autopilot } from '@/components/Autopilot';
import { Cover } from '@/components/Cover';
import { Faq } from '@/components/Faq';
import { Fleet } from '@/components/Fleet';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HostCalculator } from '@/components/HostCalculator';
import { HowItWorks } from '@/components/HowItWorks';
import { Legal } from '@/components/Legal';

// Rendered per request so listing windows track the real calendar rather than
// freezing at whatever day the image was built.
export const dynamic = 'force-dynamic';

/** Typical daily rate per category, straight from the live fleet — so the host
 *  calculator can never quote a rate that no listing actually charges. */
function classRates(fleet: ReturnType<typeof getFleet>): { category: Category; rate: number }[] {
  return CATEGORIES.map((category) => {
    const matching = fleet.filter((bike) => bike.category === category);
    const mean = matching.reduce((sum, bike) => sum + bike.pricePerDay, 0) / (matching.length || 1);
    return { category, rate: Math.round(mean) };
  });
}

export default function Home() {
  const now = today();
  const fleet = getFleet(now);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Kickstand',
    serviceType: 'Peer-to-peer motorcycle rental',
    description:
      'Rent a motorcycle from its owner, or earn from yours while it sits idle. Insurance, DVLA licence checks and the rental agreement are handled on every trip.',
    areaServed: CITIES.map((city) => ({ '@type': 'City', name: city })),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: PRICE_FLOOR,
      highPrice: PRICE_CEILING,
      offerCount: FLEET_SIZE,
      unitText: 'per day'
    }
  };

  return (
    <>
      <Header />
      <main>
        <Hero topHosts={fleet.filter((bike) => bike.host.topHost).length} />
        <Fleet
          fleet={fleet}
          today={now}
          cities={CITIES}
          categories={CATEGORIES}
          priceFloor={PRICE_FLOOR}
          priceCeiling={PRICE_CEILING}
        />
        <HowItWorks />
        <Cover />
        <Legal />
        <Autopilot fleet={fleet} today={now} />
        <HostCalculator classRates={classRates(fleet)} />
        <Faq />
      </main>
      <Footer />
      {/* Static, server-authored data — no user input reaches this. `<` is still
          escaped so a stray "</script>" could never break out of the block. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
