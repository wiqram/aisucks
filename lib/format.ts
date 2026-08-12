/** Format GBP without Intl.
 *
 *  Deliberately not `toLocaleString`: ICU data can differ between the Node build
 *  that renders on the server and the browser that hydrates, which shows up as a
 *  React hydration mismatch on prices. This is byte-identical everywhere. */
export function gbp(value: number, { decimals = 2 }: { decimals?: number } = {}): string {
  const negative = value < 0;
  const [whole, fraction] = Math.abs(value).toFixed(decimals).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '−' : ''}£${grouped}${fraction ? `.${fraction}` : ''}`;
}

/** Whole-pound form for headline figures. */
export function gbpRound(value: number): string {
  return gbp(Math.round(value), { decimals: 0 });
}
