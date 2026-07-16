'use client';

import { useMemo, useState } from 'react';
import { Topbar, Footer } from '../components/Chrome';
import {
  SEED_OPPORTUNITIES,
  STAGES,
  OPEN_STAGES,
  DIMENSION_LABELS,
  MEASURE_LABELS,
  dimensionValue,
  measureValue,
  type Dimension,
  type Measure,
  type Opportunity,
  type Stage
} from '../lib/salesforce';
import { currency, compactCurrency, number, pct } from '../lib/format';

const DIMENSIONS = Object.keys(DIMENSION_LABELS) as Dimension[];
const MEASURES = Object.keys(MEASURE_LABELS) as Measure[];
const REGIONS = ['EMEA', 'AMER', 'APAC', 'LATAM'];
const OWNERS = [...new Set(SEED_OPPORTUNITIES.map((o) => o.owner))];
const PRODUCTS = [...new Set(SEED_OPPORTUNITIES.map((o) => o.productLine))];
const INDUSTRIES = [...new Set(SEED_OPPORTUNITIES.map((o) => o.industry))];
const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtMeasure(v: number, m: Measure): string {
  if (m === 'count') return number(v);
  return currency(v);
}
function fmtMeasureCompact(v: number, m: Measure): string {
  if (m === 'count') return number(v);
  return compactCurrency(v);
}

function orderKeys(keys: string[], dim: Dimension): string[] {
  if (dim === 'stage') return STAGES.filter((s) => keys.includes(s));
  if (dim === 'closeMonth') return MONTH_ORDER.filter((mo) => keys.includes(mo));
  return keys;
}

export default function PrismPage() {
  const [dim, setDim] = useState<Dimension>('stage');
  const [pivot, setPivot] = useState<Dimension | 'none'>('none');
  const [measure, setMeasure] = useState<Measure>('amount');
  const [fRegion, setFRegion] = useState('all');
  const [fStage, setFStage] = useState('all');
  const [fOwner, setFOwner] = useState('all');
  const [fProduct, setFProduct] = useState('all');
  const [q, setQ] = useState('');

  const rows = useMemo(
    () =>
      SEED_OPPORTUNITIES.filter(
        (o) =>
          (fRegion === 'all' || o.region === fRegion) &&
          (fStage === 'all' || o.stage === fStage) &&
          (fOwner === 'all' || o.owner === fOwner) &&
          (fProduct === 'all' || o.productLine === fProduct) &&
          (q === '' || `${o.id} ${o.name} ${o.account}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [fRegion, fStage, fOwner, fProduct, q]
  );

  // KPIs
  const totalPipeline = rows.reduce((a, o) => a + o.amount, 0);
  const openRows = rows.filter((o) => OPEN_STAGES.includes(o.stage));
  const wonRows = rows.filter((o) => o.stage === 'Closed Won');
  const lostRows = rows.filter((o) => o.stage === 'Closed Lost');
  const closed = wonRows.length + lostRows.length;
  const winRate = closed === 0 ? 0 : wonRows.length / closed;
  const avgDeal = rows.length === 0 ? 0 : totalPipeline / rows.length;

  // Primary grouping
  const groups = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    for (const o of rows) {
      const k = dimensionValue(o, dim);
      (map.get(k) ?? map.set(k, []).get(k)!).push(o);
    }
    const keys = orderKeys([...map.keys()], dim);
    const built = keys.map((k) => ({ key: k, rows: map.get(k)!, value: measureValue(map.get(k)!, measure) }));
    if (dim !== 'stage' && dim !== 'closeMonth') built.sort((a, b) => b.value - a.value);
    return built;
  }, [rows, dim, measure]);
  const maxGroup = Math.max(1, ...groups.map((g) => g.value));

  // Pivot table (dim x pivot)
  const pivotData = useMemo(() => {
    if (pivot === 'none') return null;
    const colSet = new Set<string>();
    const cell = new Map<string, Map<string, Opportunity[]>>();
    for (const o of rows) {
      const r = dimensionValue(o, dim);
      const c = dimensionValue(o, pivot);
      colSet.add(c);
      if (!cell.has(r)) cell.set(r, new Map());
      const rowMap = cell.get(r)!;
      (rowMap.get(c) ?? rowMap.set(c, []).get(c)!).push(o);
    }
    const cols = orderKeys([...colSet], pivot);
    const rowKeys = orderKeys([...cell.keys()], dim);
    return { cols, rowKeys, cell };
  }, [rows, dim, pivot]);

  function exportCsv() {
    const header = ['ID', 'Name', 'Account', 'Industry', 'Region', 'Owner', 'Product Line', 'Stage', 'Amount', 'Close Date'];
    const lines = rows.map((o) =>
      [o.id, o.name, o.account, o.industry, o.region, o.owner, o.productLine, o.stage, o.amount, o.closeDate]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prism-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar active="reports" />
      <div className="page">
        <div className="page-head">
          <div className="row">
            <div>
              <h1>Prism — Salesforce Reports</h1>
              <p>
                Slice and dice your CRM pipeline. Pick a measure, group and pivot by any
                dimension, filter it down, and read it back as charts, a pivot and the underlying
                records. Export any view to CSV.
              </p>
            </div>
            <button className="btn btn--ghost" onClick={exportCsv}>
              ↓ Export CSV ({rows.length})
            </button>
          </div>
        </div>

        <div className="banner">
          <span className="dot" />
          Connected to <strong>&nbsp;Salesforce (sandbox)</strong> — {number(SEED_OPPORTUNITIES.length)} opportunities synced. Seeded demo dataset.
        </div>

        {/* KPIs */}
        <div className="kpis">
          <div className="kpi">
            <div className="l">Total pipeline</div>
            <div className="n">{compactCurrency(totalPipeline)}</div>
            <div className="sub">{rows.length} opportunities</div>
          </div>
          <div className="kpi">
            <div className="l">Open pipeline</div>
            <div className="n">{compactCurrency(openRows.reduce((a, o) => a + o.amount, 0))}</div>
            <div className="sub">{openRows.length} open deals</div>
          </div>
          <div className="kpi">
            <div className="l">Closed won</div>
            <div className="n" style={{ color: 'var(--ok)' }}>{compactCurrency(wonRows.reduce((a, o) => a + o.amount, 0))}</div>
            <div className="sub">{wonRows.length} won</div>
          </div>
          <div className="kpi">
            <div className="l">Win rate</div>
            <div className="n">{pct(winRate)}</div>
            <div className={`sub ${winRate >= 0.5 ? 'up' : 'down'}`}>{wonRows.length}W / {lostRows.length}L</div>
          </div>
          <div className="kpi">
            <div className="l">Avg deal size</div>
            <div className="n">{compactCurrency(avgDeal)}</div>
            <div className="sub">across filtered deals</div>
          </div>
        </div>

        {/* Report builder controls */}
        <div className="card panel">
          <h3>Report builder</h3>
          <div className="panel-sub">Configure the view — everything below updates live.</div>
          <div className="filters" style={{ marginBottom: 0 }}>
            <div className="field">
              <label>Measure</label>
              <select value={measure} onChange={(e) => setMeasure(e.target.value as Measure)}>
                {MEASURES.map((m) => (
                  <option key={m} value={m}>
                    {MEASURE_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Group by (rows)</label>
              <select value={dim} onChange={(e) => setDim(e.target.value as Dimension)}>
                {DIMENSIONS.map((d) => (
                  <option key={d} value={d}>
                    {DIMENSION_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Pivot by (columns)</label>
              <select value={pivot} onChange={(e) => setPivot(e.target.value as Dimension | 'none')}>
                <option value="none">— none —</option>
                {DIMENSIONS.filter((d) => d !== dim).map((d) => (
                  <option key={d} value={d}>
                    {DIMENSION_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }} />
            <div className="field">
              <label>Search</label>
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Account or opp…" />
            </div>
          </div>
          <div className="filters mt" style={{ marginBottom: 0 }}>
            <div className="field">
              <label>Region</label>
              <select value={fRegion} onChange={(e) => setFRegion(e.target.value)}>
                <option value="all">All regions</option>
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Stage</label>
              <select value={fStage} onChange={(e) => setFStage(e.target.value)}>
                <option value="all">All stages</option>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Owner</label>
              <select value={fOwner} onChange={(e) => setFOwner(e.target.value)}>
                <option value="all">All owners</option>
                {OWNERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Product line</label>
              <select value={fProduct} onChange={(e) => setFProduct(e.target.value)}>
                <option value="all">All products</option>
                {PRODUCTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart of primary grouping */}
        <div className="card panel mt">
          <div className="row-between">
            <div>
              <h3>
                {MEASURE_LABELS[measure]} by {DIMENSION_LABELS[dim]}
              </h3>
              <div className="panel-sub">{groups.length} groups · {rows.length} records</div>
            </div>
          </div>
          <div className="barlist mt">
            {groups.map((g) => (
              <div className="barrow" key={g.key}>
                <span className="k" title={g.key}>{g.key}</span>
                <span className="track">
                  <i
                    className={dim === 'stage' && g.key === 'Closed Won' ? 'g' : ''}
                    style={{ width: `${(g.value / maxGroup) * 100}%` }}
                  />
                </span>
                <span className="v">{fmtMeasureCompact(g.value, measure)}</span>
              </div>
            ))}
            {groups.length === 0 && <div className="empty">No records match these filters.</div>}
          </div>
        </div>

        {/* Pivot table */}
        {pivotData && (
          <div className="mt">
            <div className="row-between" style={{ marginBottom: '0.6rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Pivot — {DIMENSION_LABELS[dim]} × {DIMENSION_LABELS[pivot as Dimension]} · {MEASURE_LABELS[measure]}
              </h3>
            </div>
            <div className="tablewrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{DIMENSION_LABELS[dim]}</th>
                    {pivotData.cols.map((c) => (
                      <th key={c} className="num">
                        {c}
                      </th>
                    ))}
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pivotData.rowKeys.map((rk) => {
                    const rowMap = pivotData.cell.get(rk)!;
                    const rowTotal = measureValue([...rowMap.values()].flat(), measure);
                    return (
                      <tr key={rk}>
                        <td className="strong">{rk}</td>
                        {pivotData.cols.map((c) => {
                          const cellRows = rowMap.get(c) ?? [];
                          return (
                            <td key={c} className="num mono">
                              {cellRows.length ? fmtMeasureCompact(measureValue(cellRows, measure), measure) : '·'}
                            </td>
                          );
                        })}
                        <td className="num mono strong">{fmtMeasureCompact(rowTotal, measure)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Underlying records */}
        <div className="mt-lg">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Opportunities · {rows.length}
          </h3>
          <div className="tablewrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Owner</th>
                  <th>Region</th>
                  <th>Product</th>
                  <th>Stage</th>
                  <th className="num">Amount</th>
                  <th>Close</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 40).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="strong">{o.account}</span>
                      <div className="sub">
                        <span className="id-cell">{o.id}</span> · {o.industry}
                      </div>
                    </td>
                    <td>{o.owner}</td>
                    <td>{o.region}</td>
                    <td>{o.productLine}</td>
                    <td>
                      <StagePill stage={o.stage} />
                    </td>
                    <td className="num strong">{currency(o.amount)}</td>
                    <td className="sub">{o.closeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 40 && (
            <div className="muted mt" style={{ fontSize: '0.82rem' }}>
              Showing first 40 of {rows.length}. Refine filters or export the full set to CSV.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const tone =
    stage === 'Closed Won' ? 'ok' : stage === 'Closed Lost' ? 'bad' : stage === 'Negotiation' ? 'warn' : 'neutral';
  return <span className={`pill pill--${tone}`}>{stage}</span>;
}
