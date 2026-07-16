// Shared formatting helpers used across both Control Tower modules.

export const REFERENCE_TODAY = '2026-07-16';

export function currency(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
}

export function compactCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function number(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n);
}

export function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function dayMonth(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// Whole days from REFERENCE_TODAY to the given ISO date (negative = in the past).
export function daysFromToday(iso: string, today: string = REFERENCE_TODAY): number {
  const a = new Date(today + 'T00:00:00').getTime();
  const b = new Date(iso + 'T00:00:00').getTime();
  return Math.round((b - a) / 86_400_000);
}

export function relativeEta(iso: string, today: string = REFERENCE_TODAY): string {
  const d = daysFromToday(iso, today);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d < 7) return `In ${d}d`;
  if (d < 14) return 'Next week';
  return `In ${Math.round(d / 7)}w`;
}

export function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const bucket = m.get(k);
    if (bucket) bucket.push(r);
    else m.set(k, [r]);
  }
  return m;
}

export function sum(rows: number[]): number {
  return rows.reduce((a, b) => a + b, 0);
}
