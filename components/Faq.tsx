const QUESTIONS = [
  {
    q: 'If a renter damages my bike, what actually happens?',
    a: 'You report it within 72 hours with the handover photos as evidence. The claim is settled against the trip policy, not against your own insurance, so your no-claims record is untouched. The rider is liable only up to the excess on the cover they chose. Anything above £750 goes to an independent engineer before a figure is agreed.'
  },
  {
    q: 'Does listing my bike affect my own policy?',
    a: 'No. The trip is covered by a separate policy that names the rider for those dates only. Your own insurance sits dormant while the bike is out. You should still tell your insurer you host — most are fine with it, and we give you the wording to send them.'
  },
  {
    q: 'What licence do I need to rent?',
    a: 'A full category A licence for anything over 47 bhp, or category A2 for the restricted machines marked as such. We verify the category, how long you have held it and your endorsements from your DVLA record before any pickup address is released. Provisional licences and CBT-only riders cannot rent.'
  },
  {
    q: 'Can I take the bike to Europe?',
    a: 'Only on Zero Excess cover, which includes a 14-day European extension, and only with the owner’s explicit consent on the agreement. Riding outside the agreed territory voids the policy, so it is not something to improvise at the ferry port.'
  },
  {
    q: 'Who pays for fuel, tyres and the odd scuff?',
    a: 'Fuel and charge are like-for-like: return it as you found it. Consumables from normal use — tyres, chain, pads — are the owner’s. Anything caused by how you rode it is a damage claim. The photo checklist at both ends is what settles the difference, which is why it is not optional.'
  },
  {
    q: 'What if it breaks down 200 miles from home?',
    a: 'Every trip includes UK-wide recovery, 24/7, whether the fault is mechanical or a flat battery. Call the number on your agreement. If the bike cannot be made roadworthy the same day, the remaining days are refunded automatically.'
  },
  {
    q: 'What if the owner cancels on me?',
    a: 'Owner cancellations inside 48 hours are rare and penalised: we refund you in full, and we will find and part-fund an equivalent bike in the same city where one exists. Owners who do it repeatedly lose their listing.'
  }
];

export function Faq() {
  return (
    <section id="faq" className="border-b border-line">
      <div className="shell py-16 md:py-20">
        <p className="label">Questions people actually ask</p>
        <h2 className="font-display mt-3 max-w-[28rem] text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
          Before you hand over a key
        </h2>

        {/* Native <details> — open/closed works with JavaScript disabled, and the
            answers are in the HTML for search engines either way. */}
        <div className="mt-12 border-t border-line">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left">
                <h3 className="text-base font-semibold text-chalk md:text-lg">{item.q}</h3>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-signal transition-transform duration-150 ease-out group-open:rotate-45"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-[52rem] pr-10 pb-6 text-mist">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
