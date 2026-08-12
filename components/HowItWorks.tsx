const TRACKS = [
  {
    label: 'If you want to ride',
    title: 'Rent a bike',
    steps: [
      {
        heading: 'Pick your dates and your machine',
        body: 'Filter by city, licence category and budget. You only ever see bikes their owner has actually released for those days.'
      },
      {
        heading: 'Pass the licence check',
        body: 'Share a DVLA check code and photo ID. We confirm your category, how long you have held it and your endorsements before any address is released.'
      },
      {
        heading: 'Collect, photograph, ride',
        body: 'Meet the owner or have the bike delivered. You both complete a photo checklist on the app, sign the agreement, and the keys are yours.'
      }
    ]
  },
  {
    label: 'If you own one',
    title: 'List yours',
    steps: [
      {
        heading: 'Tell us when you are away',
        body: 'Block out the days you need the bike and release the rest. Two weeks in Spain is two weeks of a bike that could be earning.'
      },
      {
        heading: 'Let Autopilot price it',
        body: 'We set the daily rate against local demand, season and weekend density, and screen every rider before you see the request. Override anything you like.'
      },
      {
        heading: 'Hand over and get paid',
        body: 'Your bike is insured from the moment the trip starts. You keep 85% of the rate, paid out 48 hours in.'
      }
    ]
  }
];

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-line bg-panel">
      <div className="shell py-16 md:py-20">
        <p className="label">How it works</p>
        <h2 className="font-display mt-3 max-w-[32rem] text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
          Two sides of the same garage
        </h2>

        <div className="mt-12 grid gap-x-16 gap-y-12 lg:grid-cols-2">
          {TRACKS.map((track) => (
            <div key={track.title}>
              <div className="flex items-baseline gap-3 border-b border-line pb-4">
                <h3 className="font-display text-2xl leading-none text-chalk">{track.title}</h3>
                <span className="label">{track.label}</span>
              </div>
              <ol className="mt-7 space-y-8">
                {track.steps.map((step, index) => (
                  <li key={step.heading} className="flex gap-5">
                    <span className="num shrink-0 text-sm text-signal" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-semibold text-chalk">{step.heading}</h4>
                      <p className="mt-2 text-mist">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
