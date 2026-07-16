# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status, curl of NodePort `172.16.238.2:30100` and/or
`https://aisucks.predictonomy.com`).

---

## 2026-07-16 — Entity Data Control Tower live (Transit + Prism)

- **Shipped:** two business ideas as one internal console (portal hub at `/`):
  - **Transit** (`/track`) — global hardware-ETA tracker. Demo login for regional
    logistics colleagues (EMEA/AMER/APAC/LATAM + global admin, password
    `controltower`); contributors log shipments (routers/switches/firewalls/
    SD-WAN/servers…) with ETAs & destinations; consolidated dashboard (KPIs +
    status/region/type charts + filterable table) and a shareable customer-facing
    ETA view. Added entries + status changes persist in `localStorage`.
  - **Prism** (`/reports`) — Salesforce/ERP reporting workbench. Slice/dice
    pipeline: measure (amount/count/avg/weighted) × group-by × pivot across 7
    dimensions, filters, KPIs, bar chart, pivot table, CSV export.
  - Seeded test data: 24 shipments, 96 opportunities. Enterprise light theme
    (Hanken Grotesk / Instrument Serif / JetBrains Mono via `next/font` — no new
    npm deps, lockfile untouched). `/api/health` → `2.0.0`; new favicon.
- **Deploy:** commit `41d1bc8` pushed to `main` → webhook auto-fired Jenkins
  `aisucks` build **#14** = SUCCESS (~65s).
- **Verified live:** 2× `aisucks-web` pods `Running 1/1` (freshly rolled);
  `curl http://172.16.238.2:30100/api/health` → `version 2.0.0`; `/`, `/reports`,
  `/track`, `/icon.svg` all HTTP 200 with expected content (brand, both modules,
  pipeline KPIs, opportunity rows). 7/7 live content checks passed.
- **Default-state checkpoint** `f693e9e` (bare scaffold) unchanged for reset-on-request.

## 2026-07-15 — Reset to default state (Silver & Signal reverted)

- **Action:** operator asked to return the project to its designated default-state
  checkpoint `f693e9e` (the bare "AI Sucks!" scaffold). Reverted the two
  Silver & Signal commits with forward reverts (`ae6ee2c`, `4ed1be6`) rather than
  a force-push — resulting tree is byte-identical to `f693e9e`.
- **Deploy:** push to `main` → GitHub webhook auto-fired Jenkins `aisucks` build
  **#12** = SUCCESS (~53s).
- **Verified live:** 2× `aisucks-web` pods `Running 1/1` (freshly rolled);
  `curl http://172.16.238.2:30100/` (HTTP 200) renders **"AI Sucks!"** with no
  Silver/Signal content; `/api/health` → `version 0.1.0`; `/icon.svg` → 404.
  Project is back to the scaffold.

## 2026-07-12 — Namespace torn down (aisucks taken offline)

- **Action:** `kubectl --context prod-minikube delete namespace aisucks` (operator request).
- **Removed:** `aisucks-web` deployment (2 running pods), all ReplicaSets, and the
  NodePort `aisucks-web` service (3000:30100). Namespace was `Active` for 8d prior.
- **Verified down:** `kubectl --context prod-minikube get ns aisucks` → `NotFound`.
  Site on NodePort `30100` is offline.
- **Note:** push-to-main GitHub webhook → Jenkins auto-deploy is STILL enabled; a push
  to `main` will rebuild and recreate the namespace. Not disabled per this request.

## 2026-07-03 — Push-to-main auto-deploy wired (GitHub webhook)

- **Shipped:** GitHub push webhook on `wiqram/aisucks` → `https://jenkins.traderyolo.com/github-webhook/`
  (the `aisucks` job already had *GitHub hook trigger for GITScm polling* enabled).
- **Verified:** webhook ping → 200; a push to `main` auto-fired Jenkins build **#3**
  (~15s, no manual trigger) → SUCCESS; prod re-checked live on NodePort 30100.
- **Effect:** deploying aisucks is now just `git push origin main`.

## 2026-07-03 — Initial scaffold live in prod ("AI Sucks!" page)

- **Shipped:** bare-bones web-only Next.js app (namespace `aisucks`, image
  `container-registry.traderyolo.com/aisucks-web:latest`) serving "AI Sucks!" in
  large font + `/api/health`. NodePort `30100`.
- **Deploy:** Jenkins job `aisucks` build **#2** = SUCCESS (build → push → kubectl
  apply → rollout). Build #1 failed on an out-of-sync `package-lock.json`
  (local npm 11 vs container npm 10); fixed by regenerating the lockfile under
  node:22/npm 10.
- **Verified live:** `curl http://172.16.238.2:30100/api/health` → `{"status":"ok",
  "service":"aisucks-web",...}`; `curl http://172.16.238.2:30100/` renders "AI Sucks!".
- **Not yet done:** public HTTPS (DNS + NPM proxy host for
  `aisucks.predictonomy.com` → `172.16.238.2:30100`).
