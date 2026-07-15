# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status, curl of NodePort `172.16.238.2:30100` and/or
`https://aisucks.predictonomy.com`).

---

## 2026-07-15 — Silver & Signal photography studio site live

- **Shipped:** the first business idea on the scaffold — **Silver & Signal**, a
  photography studio landing page with **two offerings**:
  - **Silver** — genuine/traditional photography (film + portraiture), premium
    line, `from £950`.
  - **Signal** — cheaper AI-assisted editing + drone/aerial imaging, fast line,
    `from £240`.
  Full editorial-luxury darkroom design (Fraunces/Instrument Sans/IBM Plex Mono
  via `next/font` — no new npm deps, lockfile untouched): hero, collections
  split, contact-sheet portfolio, process, plain pricing, testimonials, and a
  client-side `mailto` booking form. Added aperture favicon (`app/icon.svg`);
  bumped `/api/health` to `1.0.0`.
- **Deploy:** commit `53ab8ae` pushed to `main` → GitHub webhook auto-fired
  Jenkins `aisucks` build **#10** = SUCCESS (build → push `:latest` → kubectl
  apply → rollout restart, ~59s).
- **Verified live:** `kubectl -n aisucks get po` → 2× `aisucks-web` pods
  `Running 1/1` (freshly rolled). `curl http://172.16.238.2:30100/api/health`
  → `{"status":"ok",...,"version":"1.0.0"}`; `curl http://172.16.238.2:30100/`
  (HTTP 200) contains both collections, both price points, drone packages, and
  studio contact. `/icon.svg` → 200.
- **Not changed:** the designated default-state checkpoint (`f693e9e`, the bare
  scaffold) still stands for reset-on-request.

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
