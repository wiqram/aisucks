import type { ReactNode } from 'react';

/* ----------------------------------------------------------------
   Kaya Yoga — landing page (server component, CSS-only motion).
   Built on top of the aisucks scaffold: same web-only Next.js app,
   same Docker → registry → Jenkins → NodePort pipeline.
---------------------------------------------------------------- */

/* ---- Inline line-icons (stroke = currentColor) ---- */
const ico = {
  strength: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9v6M17.5 9v6M4 10v4M20 10v4M6.5 12h11" />
    </svg>
  ),
  calm: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-2.5 2-2.5 5 0 7s2.5 5 0 7" />
      <path d="M5 8.5c1.6 1.2 1.6 3.8 0 5M19 8.5c-1.6 1.2-1.6 3.8 0 5" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13.5A8 8 0 1 1 10.5 4 6.3 6.3 0 0 0 20 13.5Z" />
      <path d="M15.5 4.5h3l-3 3h3" />
    </svg>
  ),
  focus: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 1.6v2.4M12 20v2.4M1.6 12h2.4M20 12h2.4" />
    </svg>
  ),
  breath: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h12.5a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 14h15a2.7 2.7 0 1 1-2.7 2.7" />
    </svg>
  ),
  posture: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.4" r="2.1" />
      <path d="M12 6.6v8M12 14.5c-2 0-3.4 1.6-3.6 4M12 14.5c2 0 3.4 1.6 3.6 4" />
      <path d="M8.4 9.4 12 8l3.6 1.4" />
    </svg>
  )
} as const;

function Mark({ light = false }: { light?: boolean }) {
  return (
    <svg className="brand__mark" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="12" fill="none" stroke={light ? '#e7c485' : '#d9a441'} strokeWidth="3" />
      <path d="M14 46 h36" stroke="#bf6642" strokeWidth="3" strokeLinecap="round" />
      <g stroke={light ? '#e7c485' : '#d9a441'} strokeWidth="2.4" strokeLinecap="round">
        <path d="M32 12 v-4" /><path d="M50 20 l3 -3" /><path d="M14 20 l-3 -3" />
      </g>
    </svg>
  );
}

const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const benefits: { icon: ReactNode; title: string; body: string }[] = [
  { icon: ico.strength, title: 'Strength that lasts', body: 'Build functional strength and supple, mobile joints — the kind of body that carries you through lifting, walking, and everything in between.' },
  { icon: ico.calm, title: 'A quieter mind', body: 'Moving breath and body together softens stress, lowers the mental noise, and gently lifts you out of fight-or-flight.' },
  { icon: ico.sleep, title: 'Deeper, easier sleep', body: 'Evening and restorative practice calms the nervous system, so you fall asleep faster and wake up genuinely rested.' },
  { icon: ico.focus, title: 'Focus you can feel', body: 'Steadier attention and a clearer head. The concentration you build on the mat quietly follows you to your desk.' },
  { icon: ico.breath, title: 'Breath as medicine', body: 'Simple pranayama teaches you to breathe fuller and slower — steadying your energy and your emotions, on demand.' },
  { icon: ico.posture, title: 'A spine that thanks you', body: 'Undo the toll of sitting: open tight hips, release the low back, and stand taller with aligned, pain-free posture.' }
];

const day: { time: string; title: string; body: string }[] = [
  { time: '6:30', title: 'Waking up', body: 'A few slow sun salutations shake off the stiffness of sleep and meet the day with real energy instead of grogginess.' },
  { time: '11:00', title: 'At your desk', body: 'Two minutes of neck rolls and a seated twist undo hours of hunching — no mat, no changing clothes, no one even notices.' },
  { time: '14:00', title: 'The afternoon dip', body: 'Three rounds of long, slow breathing reset your focus more reliably than another cup of coffee ever could.' },
  { time: '18:30', title: 'Coming home', body: 'A gentle flow lets you physically "put down" the workday and step out of stress mode before the evening begins.' },
  { time: '22:00', title: 'Before bed', body: 'Restorative shapes and long exhales tell your body it is safe to rest — the shortest path back to deep, real sleep.' },
  { time: 'Anytime', title: 'Under pressure', body: 'One conscious breath in a hard moment — a deadline, an argument, the kids — is yoga too. Presence is portable.' }
];

const practice: { tag: string; title: string; body: string; img: string; alt: string }[] = [
  { tag: 'Grounding', title: 'Hatha Foundations', body: 'Slow, alignment-first classes. The perfect, unintimidating place to begin.', img: '/images/balance.jpg', alt: 'A steady balancing yoga pose in the studio' },
  { tag: 'Flow', title: 'Vinyasa Flow', body: 'Breath-linked movement that builds gentle heat, strength, and grace.', img: '/images/sunrise.jpg', alt: 'A flowing yoga pose in a bright studio' },
  { tag: 'Restore', title: 'Restorative & Yin', body: 'Deep, fully-supported stillness to release, recover, and let go.', img: '/images/studio.jpg', alt: 'A calm, supported restorative class' },
  { tag: 'Stillness', title: 'Breath & Meditation', body: 'Pranayama and quiet sitting to train a steadier, clearer mind.', img: '/images/meditate.jpg', alt: 'Seated meditation at golden hour' }
];

const voices: { text: string; who: string }[] = [
  { text: 'I came for the flexibility and stayed for the calm. Kehmo made yoga feel possible for someone who could barely touch their knees.', who: 'Aanya R. — practising 1 year' },
  { text: 'The only thing that reliably quiets my mind after work. I genuinely sleep better on the days I make it to the mat.', who: 'Daniel M. — practising 8 months' },
  { text: 'Warm, patient, and never intimidating. Honestly the best decision I have made for both my back and my head.', who: 'Priya S. — practising 2 years' }
];

export default function Home() {
  return (
    <>
      {/* NAV */}
      <header className="nav">
        <div className="wrap nav__inner">
          <a className="brand" href="#top" aria-label="Kaya Yoga home">
            <Mark />
            <span className="brand__name">Kaya<span>.</span></span>
          </a>
          <nav className="nav__links" aria-label="Primary">
            <a href="#benefits">Benefits</a>
            <a href="#everyday">Everyday</a>
            <a href="#practice">Practice</a>
            <a href="#teacher">Kehmo</a>
          </nav>
          <a className="btn btn--clay nav__cta" href="#begin">Book a class <Arrow /></a>
        </div>
      </header>

      {/* HERO */}
      <main id="top">
        <section className="hero" aria-label="Introduction">
          <img
            className="hero__img"
            src="/images/hero-flow.jpg"
            alt="A yoga practitioner in a sunrise backbend by the sea"
            width={1600}
            height={1009}
            fetchPriority="high"
          />
          <div className="wrap hero__inner">
            <span className="eyebrow hero__eyebrow">Kaya Yoga · with Kehmo Nagdev</span>
            <h1>Come home to <em>your breath.</em></h1>
            <p className="hero__sub">
              A grounded, unhurried yoga practice for real, busy lives — built around how you
              actually live, work, and rest. No pretzels. No pressure. Just you, returning to yourself.
            </p>
            <div className="hero__actions">
              <a className="btn btn--light" href="#begin">Begin your practice <Arrow /></a>
              <a className="btn btn--ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(255,250,241,.4)' }} href="#benefits">
                Why yoga?
              </a>
            </div>
            <p className="hero__by">Guided by <b>Kehmo Nagdev</b> · 500-hr certified teacher</p>
          </div>
          <span className="scrollcue" aria-hidden="true">Scroll</span>
        </section>

        {/* ETHOS */}
        <section className="section ethos" aria-label="Our approach">
          <div className="wrap ethos__grid">
            <div className="reveal">
              <span className="eyebrow">The Kaya way</span>
              <p className="ethos__lead">
                Yoga isn&rsquo;t about touching your toes. It&rsquo;s about <span className="mark">what you learn</span> on the
                way down — <b>patience, breath, and coming back to yourself.</b>
              </p>
              <p className="ethos__body">
                Kaya means <em>body</em> — the vessel you live your whole life inside. Our practice is
                slow enough to feel, strong enough to matter, and kind enough that you&rsquo;ll actually
                come back tomorrow. Whatever your age, shape, or flexibility, there is a place for you here.
              </p>
            </div>
            <div className="reveal">
              <figure className="ethos__media">
                <img src="/images/meditate.jpg" alt="Seated meditation at sunrise among palm trees" width={800} height={1000} loading="lazy" />
              </figure>
              <div className="ethos__badge">
                <b>10+</b><span>years teaching</span>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="benefits" className="section benefits" aria-label="Benefits of yoga">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Why it&rsquo;s worth it</span>
              <h2>The benefits, without the mysticism.</h2>
              <p>
                Yoga is one of the most studied forms of movement there is. Here is what a regular
                practice actually gives back to your body and mind.
              </p>
            </div>
            <div className="benefit-grid">
              {benefits.map((b) => (
                <article className="bcard reveal" key={b.title}>
                  <div className="bcard__icon">{b.icon}</div>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section id="everyday" className="section day" aria-label="Where yoga helps in daily life">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">A day with yoga in it</span>
              <h2>Where it actually helps, hour by hour.</h2>
              <p>
                You don&rsquo;t need ninety spare minutes and a mountain retreat. Yoga slots into the
                real gaps of an ordinary day — and quietly changes all of them.
              </p>
            </div>
            <div className="day__grid">
              <figure className="day__media reveal">
                <img src="/images/mat.jpg" alt="A yoga mat and props laid out, ready for practice" width={900} height={1200} loading="lazy" />
                <figcaption>Small moments, repeated daily, become a different life.</figcaption>
              </figure>
              <ol className="timeline">
                {day.map((d) => (
                  <li className="tl reveal" key={d.title}>
                    <div className="tl__time">{d.time}</div>
                    <span className="tl__dot" aria-hidden="true" />
                    <div className="tl__body">
                      <h3>{d.title}</h3>
                      <p>{d.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* PRACTICE */}
        <section id="practice" className="section practice" aria-label="Ways to practise">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Ways to practise</span>
              <h2>Find the pace that fits you today.</h2>
              <p>Every body needs something different on different days. Start anywhere — you can always change lanes.</p>
            </div>
            <div className="practice-grid">
              {practice.map((p) => (
                <article className="pcard reveal" key={p.title}>
                  <img src={p.img} alt={p.alt} width={600} height={800} loading="lazy" />
                  <div className="pcard__body">
                    <span className="pcard__tag">{p.tag}</span>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TEACHER */}
        <section id="teacher" className="section teacher" aria-label="Meet Kehmo Nagdev">
          <div className="wrap teacher__grid">
            <div className="teacher__media reveal">
              <span className="teacher__blob" aria-hidden="true" />
              <div className="teacher__frame">
                <img src="/images/sunrise.jpg" alt="Kehmo Nagdev in a graceful yoga pose in a light-filled studio" width={800} height={1000} loading="lazy" />
              </div>
              <span className="teacher__sig">Kehmo</span>
            </div>
            <div className="reveal">
              <span className="eyebrow">Your teacher</span>
              <h2>Meet Kehmo Nagdev</h2>
              <p className="teacher__quote">
                &ldquo;Yoga isn&rsquo;t about the perfect pose. It&rsquo;s about coming back to yourself, one breath at a time.&rdquo;
              </p>
              <div className="teacher__body">
                <p>
                  For over a decade, Kehmo Nagdev has taught yoga the way she believes it should be
                  taught — patient, precise, and completely free of ego. Trained in the Hatha and
                  Vinyasa traditions, she has guided hundreds of students from their very first
                  wobbly downward dog to a practice they keep for life.
                </p>
                <p>
                  Her classes are known for warmth, unusually clear cues, and the quiet confidence
                  that you belong here — whatever your age, body, or flexibility. She teaches both
                  in-studio and online, so your practice travels with you.
                </p>
              </div>
              <ul className="creds">
                <li>500-hr certified</li>
                <li>10+ years teaching</li>
                <li>Hatha</li>
                <li>Vinyasa</li>
                <li>Restorative</li>
                <li>Breathwork</li>
              </ul>
            </div>
          </div>
        </section>

        {/* VOICES */}
        <section className="section section--deep voices" aria-label="What students say">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow">In their words</span>
              <h2>Students who kept coming back.</h2>
            </div>
            <div className="voices-grid">
              {voices.map((v) => (
                <figure className="quote reveal" key={v.who}>
                  <div className="quote__stars" aria-label="Five stars">★★★★★</div>
                  <blockquote><p>{v.text}</p></blockquote>
                  <figcaption className="quote__who">{v.who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* BEGIN */}
        <section id="begin" className="section begin" aria-label="Begin your practice">
          <div className="wrap">
            <div className="begin__card reveal">
              <div>
                <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>Begin</span>
                <h2>Your first class is <em>on us.</em></h2>
                <p className="begin__sub">
                  Come exactly as you are. Roll out a mat, take one breath, and let&rsquo;s begin — in the
                  studio or from your living room floor.
                </p>
                <div className="begin__actions">
                  <a className="btn btn--light" href="mailto:hello@kaya.yoga?subject=My%20first%20Kaya%20Yoga%20class">
                    Book your free first class <Arrow />
                  </a>
                  <a className="btn btn--ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(255,250,241,.4)' }} href="mailto:hello@kaya.yoga">
                    Ask a question
                  </a>
                </div>
              </div>
              <ul className="sched" aria-label="Weekly schedule">
                <li><b>Mon · Wed · Fri</b><span>7:00 AM</span></li>
                <li><b>Tue · Thu</b><span>6:30 PM</span></li>
                <li><b>Saturday community flow</b><span>9:00 AM</span></li>
                <li><b>Online, on demand</b><span>Anytime</span></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div>
              <a className="brand" href="#top" aria-label="Kaya Yoga home">
                <Mark light />
                <span className="brand__name">Kaya<span style={{ color: 'var(--clay-soft)' }}>.</span></span>
              </a>
              <p className="footer__blurb">
                Grounded, beginner-friendly yoga for everyday life. Guided by Kehmo Nagdev,
                in-studio and online.
              </p>
            </div>
            <div className="footer__col">
              <h4>Explore</h4>
              <a href="#benefits">Benefits of yoga</a>
              <a href="#everyday">A day with yoga</a>
              <a href="#practice">Ways to practise</a>
              <a href="#teacher">Meet Kehmo</a>
            </div>
            <div className="footer__col">
              <h4>Practise with us</h4>
              <a href="mailto:hello@kaya.yoga">hello@kaya.yoga</a>
              <p>Studio &amp; online classes</p>
              <p>Mornings &amp; evenings, 6 days a week</p>
              <a href="#begin">Book a free class</a>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Kaya Yoga · Taught by Kehmo Nagdev. Breathe well.</span>
            <span>Photography via <a href="https://unsplash.com" rel="noopener noreferrer">Unsplash</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
