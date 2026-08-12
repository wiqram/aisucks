import { gbp } from '@/lib/format';
import { COVERS } from '@/lib/pricing';
import { Check, Shield } from './Art';

/** Comparison matrix. `true` renders a tick, `false` a dash, strings render as-is. */
const MATRIX: { feature: string; values: (string | boolean)[] }[] = [
  { feature: 'Third-party liability', values: ['£2m', '£2m', '£2m'] },
  { feature: 'Theft and fire', values: [true, true, true] },
  { feature: 'UK-wide roadside recovery', values: [true, true, true] },
  { feature: 'Rider accident cover', values: ['£10,000', '£10,000', '£10,000'] },
  { feature: 'Accidental damage to the bike', values: [false, true, true] },
  { feature: 'Tyres, wheels and brake discs', values: [false, true, true] },
  { feature: 'Personal effects', values: [false, '£250', '£250'] },
  { feature: 'Helmet and riding gear', values: [false, false, '£750'] },
  { feature: 'Key replacement', values: [false, false, true] },
  { feature: 'Europe extension', values: [false, false, '14 days'] }
];

export function Cover() {
  return (
    <section id="cover" className="border-b border-line">
      <div className="shell py-16 md:py-20">
        <div className="max-w-[42rem]">
          <p className="label flex items-center gap-2">
            <Shield className="size-4 text-signal" />
            Insurance
          </p>
          <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.25rem)] leading-none">
            Nobody rides uninsured, ever
          </h2>
          <p className="mt-5 text-lg text-mist">
            A bike is only lent out under a policy that names the rider for the dates of the trip. Essential cover is
            bundled into every rental at no cost — the paid tiers exist purely to buy the excess down. The owner&rsquo;s
            own policy is never touched and no claim is made against their no-claims record.
          </p>
        </div>

        {/* `relative` matters: the sr-only cells inside are position:absolute, and
            without a positioned ancestor they resolve against the document and
            escape this scroll container, giving the whole page a horizontal
            scrollbar on narrow screens. */}
        <div className="relative mt-12 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <caption className="sr-only">Insurance cover compared across the three tiers</caption>
            <thead>
              <tr>
                <th scope="col" className="label border-b border-line pb-4 text-left font-medium">
                  What&rsquo;s covered
                </th>
                {COVERS.map((tier) => (
                  <th key={tier.id} scope="col" className="border-b border-line px-4 pb-4 text-left align-bottom">
                    <span className="font-display block text-xl leading-none text-chalk">{tier.name}</span>
                    <span className="num mt-2 block text-sm text-signal">
                      {tier.perDay === 0 ? 'Included' : `${gbp(tier.perDay, { decimals: 0 })}/day`}
                    </span>
                    {/* Rendered in every column, blank where it doesn't apply, so the
                        three tier names stay on one baseline. */}
                    <span className="label mt-1.5 block">
                      {tier.id === 'standard' ? 'Most chosen' : ' '}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row.feature} className="border-b border-line-soft">
                  <th scope="row" className="py-3 pr-4 text-left font-normal text-mist">
                    {row.feature}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={COVERS[index].id} className="num px-4 py-3 text-chalk">
                      {value === true ? (
                        <>
                          <Check className="size-4 text-signal" />
                          <span className="sr-only">Included</span>
                        </>
                      ) : value === false ? (
                        <>
                          <span aria-hidden="true" className="text-fog">
                            —
                          </span>
                          <span className="sr-only">Not included</span>
                        </>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-4 pr-4 text-left font-semibold text-chalk">
                  Your maximum liability
                </th>
                {COVERS.map((tier) => (
                  <td key={tier.id} className="num px-4 py-4 text-lg font-medium text-chalk">
                    {tier.excess === 0 ? 'Nothing' : gbp(tier.excess, { decimals: 0 })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 max-w-[46rem] text-sm text-fog">
          Cover is arranged per trip and runs from the moment the handover checklist is signed until the bike is
          returned. Track days, competition use, riding outside the agreed territory and carrying a pillion without the
          owner&rsquo;s consent all sit outside the policy.
        </p>
      </div>
    </section>
  );
}
