# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status + `https://aisucks.qcguy.com`).

> Verification note: the dev box **cannot** reach NodePort `172.16.238.2:30100`
> (it times out, as do all NodePorts). Verify in-cluster via `kubectl port-forward`
> and publicly via `https://aisucks.qcguy.com`.

---

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
