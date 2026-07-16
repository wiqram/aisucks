'use client';

import { useEffect, useMemo, useState } from 'react';
import { Topbar, Footer } from '../components/Chrome';
import {
  SEED_SHIPMENTS,
  DEMO_USERS,
  DEMO_PASSWORD,
  STATUS_ORDER,
  STATUS_PROGRESS,
  HARDWARE_TYPES,
  CUSTOMERS,
  isActive,
  statusTone,
  newShipmentId,
  type Shipment,
  type ShipmentStatus,
  type HardwareType,
  type Region,
  type DemoUser
} from '../lib/hardware';
import { shortDate, relativeEta, daysFromToday, groupBy } from '../lib/format';

const K_USER = 'ct-track-user';
const K_ADDED = 'ct-track-added';
const K_OVER = 'ct-track-overrides';

const STATUS_COLOR: Record<ShipmentStatus, string> = {
  Ordered: '#9aa1ad',
  'In Production': '#6b7280',
  'In Transit': '#3538cd',
  'In Customs': '#b26a00',
  'At Local DC': '#5b5ee0',
  'Out for Delivery': '#0f8a4f',
  Delivered: '#4b5563',
  Delayed: '#c5303a'
};
const REGIONS: Region[] = ['EMEA', 'AMER', 'APAC', 'LATAM'];

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function StatusPill({ status }: { status: ShipmentStatus }) {
  const tone = statusTone(status);
  return <span className={`pill pill--${tone}`}>{status}</span>;
}

function TrackMini({ status }: { status: ShipmentStatus }) {
  const p = STATUS_PROGRESS[status];
  const cls = status === 'Delayed' ? 'bad' : status === 'Delivered' ? 'done' : '';
  return (
    <div className="track-mini">
      <div className="bar">
        <i className={cls} style={{ width: `${Math.round(p * 100)}%` }} />
      </div>
    </div>
  );
}

export default function TransitPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [added, setAdded] = useState<Shipment[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<Shipment>>>({});
  const [tab, setTab] = useState<'dashboard' | 'entries' | 'customer'>('dashboard');

  useEffect(() => {
    setMounted(true);
    try {
      const u = localStorage.getItem(K_USER);
      if (u) setUser(JSON.parse(u));
      const a = localStorage.getItem(K_ADDED);
      if (a) setAdded(JSON.parse(a));
      const o = localStorage.getItem(K_OVER);
      if (o) setOverrides(JSON.parse(o));
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'customer') setTab('customer');
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  function persistAdded(next: Shipment[]) {
    setAdded(next);
    localStorage.setItem(K_ADDED, JSON.stringify(next));
  }
  function persistOverrides(next: Record<string, Partial<Shipment>>) {
    setOverrides(next);
    localStorage.setItem(K_OVER, JSON.stringify(next));
  }
  function login(u: DemoUser) {
    setUser(u);
    localStorage.setItem(K_USER, JSON.stringify(u));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem(K_USER);
    setTab('dashboard');
  }

  const shipments: Shipment[] = useMemo(() => {
    const merged = [...added, ...SEED_SHIPMENTS].map((s) => ({ ...s, ...overrides[s.id] }));
    return merged.sort((a, b) => a.eta.localeCompare(b.eta));
  }, [added, overrides]);

  if (!mounted) {
    return (
      <>
        <Topbar active="track" />
        <div className="page">
          <div className="empty">Loading Transit…</div>
        </div>
      </>
    );
  }

  if (!user) return <Login onLogin={login} />;

  return (
    <>
      <Topbar active="track">
        <div className="topbar__user">
          <span className="who muted">
            {user.name} · {user.region}
          </span>
          <div className="avatar" title={user.email}>
            {initials(user.name)}
          </div>
          <button className="btn btn--ghost btn--sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </Topbar>

      <div className="page">
        <div className="page-head">
          <div className="row">
            <div>
              <h1>Transit — Hardware ETA</h1>
              <p>
                Global hardware delivery visibility. Contributors log shipments for their region;
                everything consolidates here and can be shared with customers.
              </p>
            </div>
            <div className="tabs">
              <button className={tab === 'dashboard' ? 'on' : ''} onClick={() => setTab('dashboard')}>
                Consolidated
              </button>
              <button className={tab === 'entries' ? 'on' : ''} onClick={() => setTab('entries')}>
                My Entries
              </button>
              <button className={tab === 'customer' ? 'on' : ''} onClick={() => setTab('customer')}>
                Customer View
              </button>
            </div>
          </div>
        </div>

        {tab === 'dashboard' && <Dashboard shipments={shipments} />}
        {tab === 'entries' && (
          <Entries
            user={user}
            shipments={shipments}
            added={added}
            overrides={overrides}
            onAdd={(s) => persistAdded([s, ...added])}
            onSetStatus={(id, status) =>
              persistOverrides({
                ...overrides,
                [id]: { ...overrides[id], status, updatedBy: user.name, updatedAt: '2026-07-16' }
              })
            }
          />
        )}
        {tab === 'customer' && <CustomerView shipments={shipments} />}
      </div>
      <Footer />
    </>
  );
}

/* --------------------------------- Login --------------------------------- */
function Login({ onLogin }: { onLogin: (u: DemoUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = DEMO_USERS.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return setErr('No colleague found with that email.');
    if (password !== DEMO_PASSWORD) return setErr('Incorrect password.');
    onLogin(u);
  }

  return (
    <div className="login-shell">
      <div className="login rise">
        <h1>Sign in to Transit</h1>
        <p className="sub">Entity Data logistics colleagues, worldwide.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@entitydata.com"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn" type="submit">
            Sign in
          </button>
        </form>

        <div className="demo-users">
          <div className="h">Demo colleagues — click to sign in (password: {DEMO_PASSWORD})</div>
          {DEMO_USERS.map((u) => (
            <button
              key={u.email}
              onClick={() => {
                setEmail(u.email);
                setPassword(DEMO_PASSWORD);
                onLogin(u);
              }}
            >
              <span>
                <strong>{u.name}</strong> — {u.title}
              </span>
              <span className="r">{u.role === 'admin' ? 'ADMIN' : u.region}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Dashboard ------------------------------- */
function Dashboard({ shipments }: { shipments: Shipment[] }) {
  const [fRegion, setFRegion] = useState('all');
  const [fCustomer, setFCustomer] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fType, setFType] = useState('all');
  const [q, setQ] = useState('');

  const rows = shipments.filter(
    (s) =>
      (fRegion === 'all' || s.region === fRegion) &&
      (fCustomer === 'all' || s.customer === fCustomer) &&
      (fStatus === 'all' || s.status === fStatus) &&
      (fType === 'all' || s.hardwareType === fType) &&
      (q === '' ||
        `${s.id} ${s.customer} ${s.model} ${s.destination} ${s.trackingRef}`
          .toLowerCase()
          .includes(q.toLowerCase()))
  );

  const inFlight = rows.filter((s) => isActive(s) || s.status === 'Delayed').length;
  const delayed = rows.filter((s) => s.status === 'Delayed').length;
  const delivered = rows.filter((s) => s.status === 'Delivered').length;
  const arriving = rows.filter((s) => {
    if (!isActive(s)) return false;
    const d = daysFromToday(s.eta);
    return d >= 0 && d <= 7;
  }).length;
  const onTrack = inFlight === 0 ? 1 : (inFlight - delayed) / inFlight;

  const byStatus = STATUS_ORDER.map((st) => ({
    st,
    n: rows.filter((s) => s.status === st).length
  })).filter((x) => x.n > 0);
  const byRegion = [...groupBy(rows, (s) => s.region).entries()]
    .map(([k, v]) => ({ k, n: v.length }))
    .sort((a, b) => b.n - a.n);
  const byType = [...groupBy(rows, (s) => s.hardwareType).entries()]
    .map(([k, v]) => ({ k, n: v.length }))
    .sort((a, b) => b.n - a.n);
  const maxRegion = Math.max(1, ...byRegion.map((x) => x.n));
  const maxType = Math.max(1, ...byType.map((x) => x.n));
  const total = rows.length;

  return (
    <>
      <div className="kpis">
        <div className="kpi">
          <div className="l">In-flight</div>
          <div className="n">{inFlight}</div>
          <div className="sub">of {total} total shipments</div>
        </div>
        <div className="kpi">
          <div className="l">Arriving ≤ 7 days</div>
          <div className="n">{arriving}</div>
          <div className="sub">on-site this week</div>
        </div>
        <div className="kpi">
          <div className="l">Delayed</div>
          <div className="n" style={{ color: delayed ? 'var(--bad)' : undefined }}>
            {delayed}
          </div>
          <div className="sub">{delayed ? 'need attention' : 'all clear'}</div>
        </div>
        <div className="kpi">
          <div className="l">Delivered</div>
          <div className="n">{delivered}</div>
          <div className="sub">completed</div>
        </div>
        <div className="kpi">
          <div className="l">On-track rate</div>
          <div className="n">{Math.round(onTrack * 100)}%</div>
          <div className={`sub ${onTrack >= 0.9 ? 'up' : onTrack < 0.75 ? 'down' : ''}`}>
            of in-flight shipments
          </div>
        </div>
      </div>

      <div className="grid-2 mt">
        <div className="card panel">
          <h3>Shipments by status</h3>
          <div className="panel-sub">Distribution across the delivery journey</div>
          <div className="stackbar">
            {byStatus.map((x) => (
              <span
                key={x.st}
                style={{ width: `${(x.n / total) * 100}%`, background: STATUS_COLOR[x.st] }}
                title={`${x.st}: ${x.n}`}
              />
            ))}
          </div>
          <div className="legend">
            {byStatus.map((x) => (
              <span className="li" key={x.st}>
                <span className="dot" style={{ background: STATUS_COLOR[x.st] }} />
                {x.st} <b>{x.n}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="card panel">
          <h3>By destination region</h3>
          <div className="panel-sub">Where hardware is headed</div>
          <div className="barlist">
            {byRegion.map((x) => (
              <div className="barrow" key={x.k}>
                <span className="k">{x.k}</span>
                <span className="track">
                  <i style={{ width: `${(x.n / maxRegion) * 100}%` }} />
                </span>
                <span className="v">{x.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 mt">
        <div className="card panel">
          <h3>By hardware type</h3>
          <div className="panel-sub">What&rsquo;s moving through the pipeline</div>
          <div className="barlist">
            {byType.map((x) => (
              <div className="barrow" key={x.k}>
                <span className="k">{x.k}</span>
                <span className="track">
                  <i className="g" style={{ width: `${(x.n / maxType) * 100}%` }} />
                </span>
                <span className="v">{x.n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card panel">
          <h3>Arriving next</h3>
          <div className="panel-sub">Soonest expected on-site (active shipments)</div>
          <div className="barlist">
            {rows
              .filter((s) => isActive(s))
              .slice(0, 6)
              .map((s) => (
                <div className="barrow mut" key={s.id}>
                  <span className="k">
                    {s.customer} · {s.destination}
                  </span>
                  <span className="track" style={{ background: 'transparent' }}>
                    <StatusPill status={s.status} />
                  </span>
                  <span className="v">{relativeEta(s.eta)}</span>
                </div>
              ))}
            {rows.filter((s) => isActive(s)).length === 0 && (
              <div className="muted">No active shipments in this filter.</div>
            )}
          </div>
        </div>
      </div>

      <div className="filters mt-lg">
        <div className="field">
          <label>Search</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ID, customer, model, city, tracking…"
            style={{ minWidth: 220 }}
          />
        </div>
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
          <label>Customer</label>
          <select value={fCustomer} onChange={(e) => setFCustomer(e.target.value)}>
            <option value="all">All customers</option>
            {CUSTOMERS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Type</label>
          <select value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="all">All types</option>
            {HARDWARE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <ShipmentTable rows={rows} showUpdatedBy />
    </>
  );
}

function ShipmentTable({ rows, showUpdatedBy }: { rows: Shipment[]; showUpdatedBy?: boolean }) {
  return (
    <div className="tablewrap">
      <table className="data">
        <thead>
          <tr>
            <th>Shipment</th>
            <th>Customer</th>
            <th>Hardware</th>
            <th className="num">Qty</th>
            <th>Destination</th>
            <th>Progress</th>
            <th>Status</th>
            <th>ETA</th>
            {showUpdatedBy && <th className="hide-sm">Updated by</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>
                <span className="id-cell">{s.id}</span>
                <div className="sub mono">{s.trackingRef}</div>
              </td>
              <td className="strong">{s.customer}</td>
              <td>
                {s.model}
                <div className="sub">{s.hardwareType}</div>
              </td>
              <td className="num">{s.quantity}</td>
              <td>
                {s.destination}
                <div className="sub">{s.region} · from {s.originHub}</div>
              </td>
              <td>
                <TrackMini status={s.status} />
              </td>
              <td>
                <StatusPill status={s.status} />
              </td>
              <td>
                <strong>{shortDate(s.eta)}</strong>
                <div className="sub">{relativeEta(s.eta)}</div>
              </td>
              {showUpdatedBy && (
                <td className="hide-sm sub">
                  {s.updatedBy}
                  <div className="sub">{shortDate(s.updatedAt)}</div>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={showUpdatedBy ? 9 : 8}>
                <div className="empty">No shipments match these filters.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------- Entries -------------------------------- */
function Entries({
  user,
  shipments,
  added,
  onAdd,
  onSetStatus
}: {
  user: DemoUser;
  shipments: Shipment[];
  added: Shipment[];
  overrides: Record<string, Partial<Shipment>>;
  onAdd: (s: Shipment) => void;
  onSetStatus: (id: string, status: ShipmentStatus) => void;
}) {
  const isAdmin = user.region === 'GLOBAL';
  const myRows = shipments.filter((s) => isAdmin || s.region === user.region);

  const defaultRegion: Region = isAdmin ? 'EMEA' : (user.region as Region);
  const [form, setForm] = useState({
    customer: CUSTOMERS[0],
    hardwareType: HARDWARE_TYPES[0] as HardwareType,
    model: '',
    quantity: 1,
    destination: '',
    region: defaultRegion,
    status: 'Ordered' as ShipmentStatus,
    eta: '2026-08-01',
    note: ''
  });
  const [justAdded, setJustAdded] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.model.trim() || !form.destination.trim()) return;
    const originHub =
      form.region === 'EMEA'
        ? 'Amsterdam DC'
        : form.region === 'AMER'
        ? 'Dallas DC'
        : form.region === 'APAC'
        ? 'Singapore DC'
        : 'São Paulo DC';
    const ship: Shipment = {
      id: newShipmentId(shipments),
      customer: form.customer,
      hardwareType: form.hardwareType,
      model: form.model.trim(),
      quantity: Number(form.quantity) || 1,
      originHub,
      region: form.region,
      destination: form.destination.trim(),
      status: form.status,
      eta: form.eta,
      trackingRef: `NEW-${Math.abs(hashCode(form.model + form.destination)) % 9_000_000}`,
      updatedBy: user.name,
      updatedAt: '2026-07-16',
      note: form.note.trim() || undefined
    };
    onAdd(ship);
    setJustAdded(ship.id);
    setForm({ ...form, model: '', destination: '', note: '' });
  }

  return (
    <>
      <div className="banner">
        <span className="dot" />
        {isAdmin
          ? 'Admin — you can log shipments for any region and update any status.'
          : `You're logging shipments for ${user.region}. New entries roll straight into the consolidated dashboard.`}
      </div>

      <div className="card panel mt" style={{ marginBottom: '1.5rem' }}>
        <h3>Log a new shipment</h3>
        <div className="panel-sub">Add a hardware delivery and its expected arrival.</div>
        <form onSubmit={submit}>
          <div className="addgrid">
            <div className="field">
              <label>Customer</label>
              <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                {CUSTOMERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Hardware type</label>
              <select
                value={form.hardwareType}
                onChange={(e) => setForm({ ...form, hardwareType: e.target.value as HardwareType })}
              >
                {HARDWARE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Model</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. Cisco Catalyst 9300"
              />
            </div>
            <div className="field">
              <label>Quantity</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Destination (city, country)</label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="e.g. Paris, FR"
              />
            </div>
            <div className="field">
              <label>Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value as Region })}
                disabled={!isAdmin}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ShipmentStatus })}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Expected on-site (ETA)</label>
              <input type="date" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Note (optional)</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Anything the team should know"
              />
            </div>
          </div>
          <div className="mt">
            <button className="btn" type="submit">
              Add shipment
            </button>
            {justAdded && (
              <span className="muted" style={{ marginLeft: '0.75rem', fontSize: '0.84rem' }}>
                Added <span className="mono">{justAdded}</span> ✓
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="row-between" style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
          {isAdmin ? 'All shipments' : `${user.region} shipments`} · {myRows.length}
        </h3>
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {added.length} added by you this session
        </span>
      </div>

      <div className="tablewrap">
        <table className="data">
          <thead>
            <tr>
              <th>Shipment</th>
              <th>Customer</th>
              <th>Hardware</th>
              <th>Destination</th>
              <th>ETA</th>
              <th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {myRows.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="id-cell">{s.id}</span>
                  <div className="sub mono">{s.trackingRef}</div>
                </td>
                <td className="strong">{s.customer}</td>
                <td>
                  {s.model}
                  <div className="sub">
                    {s.hardwareType} · qty {s.quantity}
                  </div>
                </td>
                <td>
                  {s.destination}
                  <div className="sub">{s.region}</div>
                </td>
                <td>
                  <strong>{shortDate(s.eta)}</strong>
                  <div className="sub">{relativeEta(s.eta)}</div>
                </td>
                <td>
                  <select
                    value={s.status}
                    onChange={(e) => onSetStatus(s.id, e.target.value as ShipmentStatus)}
                    style={{ minWidth: 150 }}
                  >
                    {STATUS_ORDER.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {myRows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No shipments yet — add your first above.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ------------------------------ Customer View ---------------------------- */
function CustomerView({ shipments }: { shipments: Shipment[] }) {
  const [customer, setCustomer] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const c = new URLSearchParams(window.location.search).get('customer');
      if (c && CUSTOMERS.includes(c)) return c;
    }
    return CUSTOMERS[0];
  });
  const [copied, setCopied] = useState(false);

  const rows = shipments.filter((s) => s.customer === customer);
  const active = rows.filter((s) => isActive(s) || s.status === 'Delayed');
  const nextEta = active.slice().sort((a, b) => a.eta.localeCompare(b.eta))[0];

  function share() {
    const url = `${window.location.origin}/track?view=customer&customer=${encodeURIComponent(customer)}`;
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false)
    );
  }

  return (
    <>
      <div className="banner">
        <span className="dot" />
        Customer-facing view — this is exactly what <strong>&nbsp;{customer}</strong> sees. No
        internal notes, tracking refs or other customers.
      </div>

      <div className="filters">
        <div className="field">
          <label>Customer</label>
          <select value={customer} onChange={(e) => setCustomer(e.target.value)} style={{ minWidth: 220 }}>
            {CUSTOMERS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--ghost" onClick={share} style={{ alignSelf: 'flex-end' }}>
          {copied ? 'Link copied ✓' : 'Copy share link'}
        </button>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="l">Open deliveries</div>
          <div className="n">{active.length}</div>
          <div className="sub">in progress for {customer}</div>
        </div>
        <div className="kpi">
          <div className="l">Delivered</div>
          <div className="n">{rows.filter((s) => s.status === 'Delivered').length}</div>
          <div className="sub">completed to date</div>
        </div>
        <div className="kpi">
          <div className="l">Next arrival</div>
          <div className="n" style={{ fontSize: '1.3rem' }}>
            {nextEta ? shortDate(nextEta.eta) : '—'}
          </div>
          <div className="sub">{nextEta ? `${nextEta.destination}` : 'nothing scheduled'}</div>
        </div>
      </div>

      <div className="tablewrap mt">
        <table className="data">
          <thead>
            <tr>
              <th>Hardware</th>
              <th className="num">Qty</th>
              <th>Destination</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Expected arrival</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="strong">{s.model}</span>
                  <div className="sub">{s.hardwareType}</div>
                </td>
                <td className="num">{s.quantity}</td>
                <td>{s.destination}</td>
                <td>
                  <TrackMini status={s.status} />
                </td>
                <td>
                  <StatusPill status={s.status} />
                </td>
                <td>
                  <strong>{shortDate(s.eta)}</strong>
                  <div className="sub">{relativeEta(s.eta)}</div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No shipments on record for {customer}.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
