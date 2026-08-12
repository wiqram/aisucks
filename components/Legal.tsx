const COLUMNS = [
  {
    title: 'Rider verification',
    items: [
      'DVLA check code, validated on the day of booking',
      'Category A or A2 entitlement held for at least two years',
      'Minimum age 21, or 25 for anything over 900cc',
      'Photo ID matched against the payment card',
      'Six penalty points or fewer, no IN or DR endorsements'
    ]
  },
  {
    title: 'The rental agreement',
    items: [
      'A fresh agreement is signed digitally for every trip',
      'Named rider only — no one else may take the controls',
      'Mileage allowance per day, then a per-mile rate agreed up front',
      'UK mainland as standard; Europe only on Zero Excess cover',
      'No track days, competition, courier or instruction use'
    ]
  },
  {
    title: 'Money and disputes',
    items: [
      'Refundable pre-authorisation, released 48 hours after return',
      'Timestamped photo checklist at both ends of every trip',
      'Damage claims raised within 72 hours, evidence on both sides',
      'Independent engineer assessment on anything above £750',
      'Hosts paid 48 hours after the trip starts, keeping 85%'
    ]
  }
];

export function Legal() {
  return (
    <section id="legal" className="border-b border-line bg-panel">
      <div className="shell py-16 md:py-20">
        <div className="max-w-[42rem]">
          <p className="label">Legal and compliance</p>
          <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
            The boring part, done properly
          </h2>
          <p className="mt-5 text-lg text-mist">
            The reason people don&rsquo;t lend their bike out is not that they lack goodwill — it&rsquo;s that the
            paperwork is frightening. So the paperwork is ours. Owners hand over a key; everything below happens
            underneath.
          </p>
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-line pt-10 md:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-xl leading-none text-chalk">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-mist">
                    <span aria-hidden="true" className="mt-2 inline-block size-1 shrink-0 rounded-full bg-signal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-[46rem] border-t border-line pt-8 text-sm text-fog">
          Hosting income is taxable. The UK trading allowance covers the first £1,000 a year; above that, earnings go on
          a self-assessment return. We issue an annual statement in April with everything HMRC asks for.
        </p>
      </div>
    </section>
  );
}
