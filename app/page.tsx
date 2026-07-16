import { Topbar, Footer } from './components/Chrome';
import { SEED_SHIPMENTS, isActive } from './lib/hardware';
import { SEED_OPPORTUNITIES, OPEN_STAGES } from './lib/salesforce';
import { compactCurrency, number } from './lib/format';

// Portal hub — the front door to the two Control Tower modules.

export default function Hub() {
  const activeShipments = SEED_SHIPMENTS.filter(isActive).length;
  const regions = new Set(SEED_SHIPMENTS.map((s) => s.region)).size;
  const openPipeline = SEED_OPPORTUNITIES.filter((o) => OPEN_STAGES.includes(o.stage)).reduce(
    (a, o) => a + o.amount,
    0
  );

  return (
    <div className="hub">
      <Topbar active="hub" />
      <main className="wrap" style={{ flex: 1 }}>
        <section className="hub__hero rise">
          <span className="eyebrow">Entity Data · Internal Operations Console</span>
          <h1 style={{ marginTop: '0.75rem' }}>
            One console for <em>where things are</em> and <em>how we&rsquo;re doing</em>.
          </h1>
          <p>
            Control Tower brings two jobs into one place: track every piece of hardware Entity
            Data ships to customers worldwide, and slice your Salesforce pipeline into the
            reports you actually need — no waiting on a BI team.
          </p>
        </section>

        <section className="hub__modules">
          <article className="module module--track rise">
            <span className="module__tag">Module 01 — Logistics</span>
            <h2>
              Transit <span>· Hardware ETA</span>
            </h2>
            <p>
              Colleagues across EMEA, AMER, APAC and LATAM log every shipment — routers,
              switches, firewalls, SD-WAN and more — and it rolls up into one live dashboard.
              Share a clean ETA view with each customer showing exactly what arrives where, and
              when.
            </p>
            <div className="module__stats">
              <div className="s">
                <div className="n tnum">{activeShipments}</div>
                <div className="l">Active shipments</div>
              </div>
              <div className="s">
                <div className="n tnum">{regions}</div>
                <div className="l">Regions reporting</div>
              </div>
              <div className="s">
                <div className="n tnum">{new Set(SEED_SHIPMENTS.map((s) => s.customer)).size}</div>
                <div className="l">Customers</div>
              </div>
            </div>
            <a className="btn" href="/track">
              Open Transit →
            </a>
          </article>

          <article className="module module--prism rise">
            <span className="module__tag">Module 02 — Analytics</span>
            <h2>
              Prism <span>· Salesforce Reports</span>
            </h2>
            <p>
              A self-serve reporting workbench over your Salesforce data. Filter, group and pivot
              opportunities by stage, region, owner, product or month; switch measures between
              revenue, count, average deal size and weighted pipeline; and read it back as tables
              and charts.
            </p>
            <div className="module__stats">
              <div className="s">
                <div className="n tnum">{number(SEED_OPPORTUNITIES.length)}</div>
                <div className="l">Opportunities</div>
              </div>
              <div className="s">
                <div className="n tnum">{compactCurrency(openPipeline)}</div>
                <div className="l">Open pipeline</div>
              </div>
              <div className="s">
                <div className="n tnum">7</div>
                <div className="l">Dimensions</div>
              </div>
            </div>
            <a className="btn" href="/reports" style={{ background: '#0f8a4f', borderColor: '#0f8a4f' }}>
              Open Prism →
            </a>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
