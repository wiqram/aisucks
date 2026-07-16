// ---------------------------------------------------------------------------
// Prism — Salesforce/ERP reporting front-end: domain types + seeded CRM data.
// Mirrors the shape of Salesforce Opportunity + Account objects so the report
// builder can slice/dice (group-by, filter, aggregate) like a real CRM export.
// Data is generated deterministically (index-based, no RNG) so it's stable
// across reloads and reproducible.
// ---------------------------------------------------------------------------

export type Stage =
  | 'Prospecting'
  | 'Qualification'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export const STAGES: Stage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const OPEN_STAGES: Stage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];

// Rough probability weighting per stage (for weighted pipeline).
export const STAGE_PROBABILITY: Record<Stage, number> = {
  Prospecting: 0.1,
  Qualification: 0.25,
  Proposal: 0.5,
  Negotiation: 0.75,
  'Closed Won': 1,
  'Closed Lost': 0
};

export type Region = 'EMEA' | 'AMER' | 'APAC' | 'LATAM';

export interface Opportunity {
  id: string;
  name: string;
  account: string;
  industry: string;
  region: Region;
  owner: string;
  productLine: string;
  stage: Stage;
  amount: number;
  createdDate: string; // ISO
  closeDate: string; // ISO
}

const ACCOUNTS: { name: string; industry: string; region: Region }[] = [
  { name: 'Northwind Bank', industry: 'Financial Services', region: 'EMEA' },
  { name: 'Meridian Health', industry: 'Healthcare', region: 'AMER' },
  { name: 'Aeon Retail Group', industry: 'Retail', region: 'APAC' },
  { name: 'Helios Energy', industry: 'Energy & Utilities', region: 'EMEA' },
  { name: 'Vertex Telecom', industry: 'Telecommunications', region: 'AMER' },
  { name: 'Cobalt Logistics', industry: 'Transport & Logistics', region: 'LATAM' },
  { name: 'Solstice Media', industry: 'Media & Tech', region: 'AMER' },
  { name: 'Granite Manufacturing', industry: 'Manufacturing', region: 'APAC' },
  { name: 'Azure Insurance', industry: 'Financial Services', region: 'EMEA' },
  { name: 'Delta Public Sector', industry: 'Public Sector', region: 'LATAM' }
];

const OWNERS: { name: string; region: Region }[] = [
  { name: 'Amara Osei', region: 'EMEA' },
  { name: 'Diego Márquez', region: 'LATAM' },
  { name: 'Wei Chen', region: 'APAC' },
  { name: 'Sarah Klein', region: 'AMER' },
  { name: 'Tomas Berg', region: 'EMEA' },
  { name: 'Nadia Rahman', region: 'APAC' }
];

const PRODUCT_LINES = [
  'Network Hardware',
  'Managed SD-WAN',
  'Security Appliances',
  'Data Centre',
  'Support & Maintenance',
  'Professional Services'
];

// Deterministic pseudo-spread helpers (index-based, stable).
const STAGE_SPREAD: Stage[] = [
  'Prospecting', 'Prospecting', 'Qualification', 'Qualification', 'Qualification',
  'Proposal', 'Proposal', 'Negotiation', 'Negotiation',
  'Closed Won', 'Closed Won', 'Closed Won', 'Closed Lost'
];

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function build(): Opportunity[] {
  const rows: Opportunity[] = [];
  const N = 96;
  for (let i = 0; i < N; i++) {
    const account = ACCOUNTS[i % ACCOUNTS.length];
    const owner = OWNERS[(i * 3 + 1) % OWNERS.length];
    const productLine = PRODUCT_LINES[(i * 5 + 2) % PRODUCT_LINES.length];
    const stage = STAGE_SPREAD[(i * 7) % STAGE_SPREAD.length];

    // Amount: varied 15k–520k, deterministic.
    const base = 15_000 + ((i * 37) % 48) * 9_500 + ((i * 13) % 7) * 4_250;
    const amount = Math.round(base / 500) * 500;

    // Dates spread across FY2026.
    const createdM = MONTHS[i % 9]; // created Jan–Sep
    const closeMonthIdx = Math.min(11, (i % 9) + 2 + (i % 3));
    const closeM = MONTHS[closeMonthIdx];
    const createdDay = String(((i * 3) % 27) + 1).padStart(2, '0');
    const closeDay = String(((i * 5) % 27) + 1).padStart(2, '0');

    rows.push({
      id: `OPP-${1001 + i}`,
      name: `${account.name} — ${productLine}`,
      account: account.name,
      industry: account.industry,
      region: account.region,
      owner: owner.name,
      productLine,
      stage,
      amount,
      createdDate: `2026-${createdM}-${createdDay}`,
      closeDate: `2026-${closeM}-${closeDay}`
    });
  }
  return rows;
}

export const SEED_OPPORTUNITIES: Opportunity[] = build();

// ------------------------- report engine -----------------------------------

export type Dimension = 'stage' | 'region' | 'owner' | 'industry' | 'productLine' | 'account' | 'closeMonth';
export type Measure = 'amount' | 'count' | 'avg' | 'weighted';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  stage: 'Stage',
  region: 'Region',
  owner: 'Owner',
  industry: 'Industry',
  productLine: 'Product Line',
  account: 'Account',
  closeMonth: 'Close Month'
};

export const MEASURE_LABELS: Record<Measure, string> = {
  amount: 'Total Amount',
  count: 'Opportunity Count',
  avg: 'Average Deal Size',
  weighted: 'Weighted Pipeline'
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dimensionValue(o: Opportunity, dim: Dimension): string {
  if (dim === 'closeMonth') {
    const m = Number(o.closeDate.slice(5, 7)) - 1;
    return MONTH_NAMES[m] ?? o.closeDate.slice(0, 7);
  }
  return String(o[dim]);
}

export function measureValue(rows: Opportunity[], measure: Measure): number {
  if (rows.length === 0) return 0;
  if (measure === 'count') return rows.length;
  if (measure === 'amount') return rows.reduce((a, r) => a + r.amount, 0);
  if (measure === 'avg') return rows.reduce((a, r) => a + r.amount, 0) / rows.length;
  // weighted pipeline
  return rows.reduce((a, r) => a + r.amount * STAGE_PROBABILITY[r.stage], 0);
}
