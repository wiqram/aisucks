import type { Metadata } from 'next';
import BookingForm from './BookingForm';

// Silver & Signal — a photography studio landing page with two offerings:
//   · Silver  = genuine, traditional photography (film + portraiture), premium
//   · Signal  = AI-assisted editing + drone/aerial imaging, faster & cheaper
// Pure server component (one small client form for the mailto booking flow).

export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

const APERTURE = (
  <svg className="brand__mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" />
    <path
      d="M24 3 L37 12 M45 24 L30 33 M24 45 L11 36 M3 24 L18 15"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const portfolio = [
  { cls: 'f1', title: 'Golden Hour, Kodak Portra', line: 'Silver' },
  { cls: 'f2', title: 'Coastline, 120m AGL', line: 'Signal' },
  { cls: 'f3', title: 'Studio Portrait, 85mm', line: 'Silver' },
  { cls: 'f4', title: 'Rooftop Orbit', line: 'Signal' },
  { cls: 'f5', title: 'Bridal, Available Light', line: 'Silver' },
  { cls: 'f6', title: 'Estate Survey, 4K', line: 'Signal' },
  { cls: 'f7', title: 'The Ceremony, Medium Format', line: 'Silver' }
];

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#top">
            {APERTURE}
            Silver <span className="amp">&amp;</span> Signal
          </a>
          <nav className="nav__links">
            <a href="#collections">Collections</a>
            <a href="#work">Work</a>
            <a href="#pricing">Pricing</a>
            <a href="#studio">Studio</a>
            <a className="btn btn--ghost nav__cta" href="#contact">
              Book a shoot
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero__grid">
            <div>
              <span className="eyebrow rise rise-1">Est. 2026 · Studio of Light</span>
              <h1 className="display hero__title rise rise-2">
                Two ways to <span className="w-silver">hold</span> the{' '}
                <span className="w-signal">light</span>.
              </h1>
              <p className="hero__lede rise rise-3">
                Silver &amp; Signal is a photography studio with a split soul —{' '}
                <strong>hand-made film &amp; portraiture</strong> on one side,{' '}
                <strong>AI-assisted and drone imaging</strong> on the other. Same eye.
                Two tempos. Two prices.
              </p>
              <div className="hero__actions rise rise-4">
                <a className="btn" href="#collections">
                  Explore the collections <span className="arrow">→</span>
                </a>
                <a className="btn btn--ghost" href="#work">
                  See the work
                </a>
              </div>
            </div>

            <div className="hero__stats rise rise-5">
              <div className="stat">
                <span className="n">480+</span>
                <span className="l">Shoots delivered</span>
              </div>
              <div className="stat">
                <span className="n">2</span>
                <span className="l">Distinct collections</span>
              </div>
              <div className="stat">
                <span className="n">48h</span>
                <span className="l">Signal turnaround</span>
              </div>
              <div className="stat">
                <span className="n">∞</span>
                <span className="l">Silver patience</span>
              </div>
            </div>
          </div>
        </section>

        {/* COLLECTIONS — the split */}
        <section id="collections">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>
                One studio. <span className="serif-i">Two</span> collections.
              </h2>
              <p>
                Pick the tempo that fits the moment. Both are shot by the same team, held to
                the same eye — they just move at different speeds and price points.
              </p>
            </div>

            <div className="split">
              {/* SILVER */}
              <article className="offer reveal">
                <div className="offer__index">01 — The Genuine Line</div>
                <h3 className="offer__name">
                  Silver<em>.</em>
                </h3>
                <div className="offer__tag">Film · Portraiture · Human-made</div>
                <p className="offer__desc">
                  Traditional photography, made by hand. Medium-format film and full-frame
                  digital, natural light, real locations, unhurried direction. For the images
                  you&rsquo;ll still be framing on a wall in twenty years.
                </p>
                <ul className="offer__list">
                  <li>Film + full-frame digital capture</li>
                  <li>Hand-retouched, colour-graded by a person</li>
                  <li>On-location or in the daylight studio</li>
                  <li>Archival fine-art prints available</li>
                  <li>2–3 week considered delivery</li>
                </ul>
                <div className="offer__foot">
                  <div className="offer__price">
                    <small>Investment</small>
                    <span className="amt">from £950</span>
                  </div>
                  <a className="offer__link" href="#pricing">
                    View packages →
                  </a>
                </div>
              </article>

              {/* SIGNAL */}
              <article className="offer offer--signal reveal">
                <div className="offer__index">02 — The AI + Aerial Line</div>
                <h3 className="offer__name">
                  Signal<em>.</em>
                </h3>
                <div className="offer__tag">Drone · AI Retouch · Fast &amp; affordable</div>
                <p className="offer__desc">
                  The quick, budget-friendly line. Licensed drone &amp; aerial capture paired
                  with AI-assisted editing, generative retouch and upscaling — studio-grade
                  results for property, events and brands at a fraction of the time and cost.
                </p>
                <ul className="offer__list">
                  <li>Licensed drone / aerial capture (4K &amp; stills)</li>
                  <li>AI retouch, clean-up &amp; upscaling</li>
                  <li>Same-week edits, web &amp; social ready</li>
                  <li>Bulk property, listing &amp; content packs</li>
                  <li>48-hour standard turnaround</li>
                </ul>
                <div className="offer__foot">
                  <div className="offer__price">
                    <small>Investment</small>
                    <span className="amt">from £240</span>
                  </div>
                  <a className="offer__link" href="#pricing">
                    View packages →
                  </a>
                </div>
              </article>
            </div>

            <p className="split-note reveal">
              Not sure which? Most clients book <b>Silver</b> for the moments that matter — and{' '}
              <i>Signal</i> for everything that needs to move fast.
            </p>
          </div>
        </section>

        {/* WORK — contact sheet */}
        <section id="work">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>Selected frames.</h2>
              <p>
                A working contact sheet across both collections — warm frames are Silver, cool
                frames are Signal. Hover for the details.
              </p>
            </div>
            <div className="sheet reveal">
              {portfolio.map((f) => (
                <figure className={`frame ${f.cls}`} key={f.cls}>
                  <figcaption className="frame__meta">
                    <span className="t">{f.title}</span>
                    <span className={`c ${f.line === 'Silver' ? 'c--silver' : 'c--signal'}`}>
                      {f.line}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="studio">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>How a shoot runs.</h2>
              <p>
                Simple, transparent, and the same shape whichever collection you choose — only
                the tempo changes.
              </p>
            </div>
            <div className="steps reveal">
              <div className="step">
                <span className="num">01 — Brief</span>
                <h3>Tell us the story</h3>
                <p>
                  A short call to pin down the vision, the light, the location and which line
                  fits. Fixed quote, no surprises.
                </p>
              </div>
              <div className="step">
                <span className="num">02 — Shoot</span>
                <h3>We capture</h3>
                <p>
                  Silver on film &amp; full-frame with patient direction; Signal in the air with
                  drones and rapid ground coverage.
                </p>
              </div>
              <div className="step">
                <span className="num">03 — Craft</span>
                <h3>Edit &amp; grade</h3>
                <p>
                  Hand retouching for Silver; AI-assisted clean-up, upscaling and colour for
                  Signal. Always reviewed by a human.
                </p>
              </div>
              <div className="step">
                <span className="num">04 — Deliver</span>
                <h3>Yours to keep</h3>
                <p>
                  A private online gallery, full-resolution downloads, and optional archival
                  prints or motion reels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>Plain pricing.</h2>
              <p>
                Starting points, not fine print. Every shoot gets a fixed quote once we know the
                brief.
              </p>
            </div>
            <div className="price-grid">
              <div className="plan reveal">
                <div className="plan__head">
                  <h3>
                    Silver<em>.</em>
                  </h3>
                  <span className="kind">The Genuine Line</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Portrait Session
                    <span className="desc">2 hours · film + digital · 40 edited images</span>
                  </span>
                  <span className="cost">£950</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Half-Day Editorial
                    <span className="desc">4 hours · locations · 80 edited images</span>
                  </span>
                  <span className="cost">£1,650</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Weddings &amp; Events
                    <span className="desc">Full day · two shooters · fine-art album</span>
                  </span>
                  <span className="cost">from £2,400</span>
                </div>
              </div>

              <div className="plan plan--signal reveal">
                <div className="plan__head">
                  <h3>
                    Signal<em>.</em>
                  </h3>
                  <span className="kind">The AI + Aerial Line</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Drone Reel
                    <span className="desc">Single site · 60–90s edited aerial reel + stills</span>
                  </span>
                  <span className="cost">£240</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Property Pack
                    <span className="desc">Aerial + ground · 25 AI-graded listing images</span>
                  </span>
                  <span className="cost">£320</span>
                </div>
                <div className="tier">
                  <span className="name">
                    Brand Content Day
                    <span className="desc">Drone + AI retouch · 100+ assets, 48h delivery</span>
                  </span>
                  <span className="cost">£680</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section>
          <div className="wrap">
            <div className="quotes">
              <figure className="quote reveal">
                <blockquote>
                  <span className="mk">&ldquo;</span>They shot our wedding on film and it feels
                  like a memory, not a photo. Nothing else has come close.
                  <span className="mk">&rdquo;</span>
                </blockquote>
                <figcaption>Amara &amp; Tom · Silver · Wedding</figcaption>
              </figure>
              <figure className="quote quote--signal reveal">
                <blockquote>
                  <span className="mk">&ldquo;</span>The drone reel and AI-edited listing shots
                  went live in two days and the flat sold in a week. Ridiculous value.
                  <span className="mk">&rdquo;</span>
                </blockquote>
                <figcaption>Priya N. · Signal · Property</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <div className="wrap contact__grid">
            <div className="contact__lead reveal">
              <span className="eyebrow eyebrow--silver">Book a shoot</span>
              <h2 style={{ marginTop: '1.2rem' }}>
                Let&rsquo;s make <span className="serif-i">something</span> worth keeping.
              </h2>
              <p>
                Tell us a little about what you have in mind and which line calls to you. We
                read every enquiry and reply within one working day.
              </p>
              <div className="contact__meta">
                <a href="mailto:hello@silverandsignal.studio">
                  <span className="k">Email</span> hello@silverandsignal.studio
                </a>
                <a href="tel:+442080000000">
                  <span className="k">Phone</span> +44 20 8000 0000
                </a>
                <span>
                  <span className="k">Studio</span> Daylight loft · London &amp; on location
                </span>
                <span>
                  <span className="k">Hours</span> Mon–Sat · by appointment
                </span>
              </div>
            </div>
            <div className="reveal">
              <BookingForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <span>© 2026 Silver &amp; Signal — Photography Studio</span>
          <span>Silver, made by hand · Signal, powered by AI &amp; drones</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
