# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status + `https://aisucks.qcguy.com`).

> Verification note: the dev box **cannot** reach NodePort `172.16.238.2:30100`
> (it times out, as do all NodePorts). Verify in-cluster via `kubectl port-forward`
> and publicly via `https://aisucks.qcguy.com`.

---

## 2026-08-12 — Kickstand shipped: peer-to-peer motorcycle rental

- **Shipped:** the business idea, built on the scaffold. **Kickstand** — rent a
  motorcycle from its owner, or earn from yours while it sits idle. 15 privately-owned
  listings across 8 UK cities, filterable by city/category/A2 licence/price/instant-book
  and by date; a booking sheet that quotes itemised prices (daily rate, weekly and
  monthly rates, insurance tier, extras, 9% service fee, deposit pre-auth); three
  insurance tiers compared in full; a legal section covering DVLA licence checks, the
  per-trip agreement, territory and mileage limits and the disputes process; "Autopilot"
  automated pricing that shows its reasoning and is capped at ±30% of the host's own
  rate; and a host earnings calculator built on observed 62% occupancy.
- **No database, by design.** The fleet is a data module and
  `/api/{bikes,quote,bookings}` are stubs that validate input and re-price server-side
  without persisting anything. Booking a clashing date returns 409, not 400.
- **Two decisions worth keeping:** listing windows are stored as *day offsets* and
  resolved against a supplied `today`, so the fleet can never drift into showing a
  calendar that only worked the month it was deployed; and the clock is read in exactly
  one place (`lib/today.ts`), which is what keeps SSR and hydration in agreement.
- **Fonts self-hosted** (~85 KB, `next/font/local`) rather than `next/font/google`, so
  the production image builds with no outbound network beyond npm — one fewer way for a
  build to fail mid-demo.
- **Bugs found and fixed before shipping**, all by testing rather than by reading:
  Autopilot was suggesting **+58%** over the standing rate because city, season and
  weekend multipliers compounded on a rate that already priced in city and season
  (now damped deviations from a baseline, hard-capped at 30%); the booking dialog
  rendered pinned to the top-left because Tailwind's reset zeroes `margin` and silently
  removes the UA's `margin: auto` on a modal `<dialog>`; and the insurance table's
  `sr-only` cells are `position: absolute`, so with no positioned ancestor they resolved
  against the document, escaped their `overflow-x-auto` wrapper and gave the whole page
  a horizontal scrollbar on mobile.
- **Also fixed:** the scaffold shipped a `lint` script with **no ESLint config**, so
  `npm run lint` had never linted anything. Added `eslint.config.mjs`; it immediately
  caught an `<a href="/">` that should have been `next/link`.
- **Tests:** 63 unit tests via `node --test` (no test-framework dependency — Node strips
  the types). They assert that quote lines always reconcile to the printed subtotal,
  discount thresholds at exactly 7 and 28 days, BST-safe date maths, availability
  overlap at both boundaries, earnings monotonicity, and that Autopilot stays inside its
  cap across 5,760 city/category/date/length combinations. Plus `scripts/smoke.mjs` —
  67 integration checks that run against **any** base URL, so the identical assertions
  gate the local build and verify prod. It imports `lib/` directly, so it checks the
  deployed API's prices against the pricing module rather than hardcoded numbers.
- **Deploy:** push to `main` auto-fired Jenkins **#23** = **SUCCESS** (~75s).
- **Verified live:** fresh pods (2/2 Running, 20–33s old), rollout complete, running
  image `aisucks-web:latest`; in-cluster health via port-forward `version 1.0.0`
  (bumped from `0.1.1` as deploy proof); public `https://aisucks.qcguy.com` → 200 with
  the fleet in the HTML. **All 67 smoke checks passed against the public URL**,
  including `opacity:0` count = 0, every one of the 15 listings and its price present in
  the server-rendered HTML, quote totals matching the pricing module, and 409s on
  clashing dates. Booking flow driven end to end in a real browser at 1440px and 390px:
  quote → confirm → reference `KS-xxxx`, no console errors or hydration warnings.

## 2026-08-08 — Public domain repointed to aisucks.qcguy.com

- **Shipped:** `NEXT_PUBLIC_SITE_URL` now `https://aisucks.qcguy.com` in
  `.env.production` + the `deployment.yaml` env, and as the `metadataBase` fallback in
  `app/layout.tsx`; README updated. The previous `aisucks.predictonomy.com` never got an
  NPM proxy host (dummy cert + 404) and is abandoned. `/api/health` fallback version
  bumped `0.1.0` → `0.1.1` so a deploy can be *proven* landed, not inferred.
- **Deploy:** confirmed **push-to-main auto-triggers Jenkins** — build **#19** fired
  ~10s after `git push` with no manual trigger and finished **SUCCESS** in ~55s.
- **Verified live:** fresh pods (2/2 Running, 24–36s old); in-cluster via port-forward
  `{"service":"aisucks-web","version":"0.1.1"}`; publicly
  `https://aisucks.qcguy.com/api/health` → same `0.1.1`, `GET /` → 200 rendering
  "AI Sucks!". Total push→live ≈ 90s. Public site is Cloudflare-fronted
  (`server: cloudflare`, Google Trust Services cert, HTML `cf-cache-status: DYNAMIC`
  so page changes are not cached); HTTP 301s to HTTPS.

## 2026-07-20 — Reset to default state (Control Tower reverted)

- **Action:** operator asked to return the project to its designated default-state
  checkpoint `f693e9e` (the bare "AI Sucks!" scaffold). Reverted the two Entity Data
  Control Tower commits with forward reverts (`5c4caaf`, `e6e8e30`) rather than a
  force-push — resulting tree is byte-identical to `f693e9e` (Transit/Prism, Chrome,
  and all `app/lib/*` removed).
- **Deploy:** push to `main` → GitHub webhook auto-fired Jenkins `aisucks` build
  **#16** = SUCCESS (~82s).
- **Verified live:** `curl http://172.16.238.2:30100/` (HTTP 200) renders **"AI Sucks!"**
  with no Transit/Prism/Control Tower content; `/api/health` → `version 0.1.0`;
  `/track`, `/reports`, and `/icon.svg` all → 404. Project is back to the scaffold.

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
