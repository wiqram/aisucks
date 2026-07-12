# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status, curl of NodePort `172.16.238.2:30100` and/or
`https://aisucks.predictonomy.com`).

---

## 2026-07-12 — Business idea shipped: "Kaya Yoga" site (Kehmo Nagdev)

- **Shipped:** the real business idea, built on top of the scaffold — **Kaya Yoga**, a
  yoga marketing site guided by instructor **Kehmo Nagdev**. Single Next.js page with
  sections: hero, ethos, **benefits of yoga** (6 cards), **where yoga helps hour-by-hour**
  in daily life (timeline), practice styles, Meet Kehmo Nagdev, testimonials, and a
  "first class free" CTA. "Warm dawn / organic editorial" design — Fraunces + Nunito Sans
  (self-hosted woff2, latin), earth palette, grain + organic blob graphics, CSS scroll reveals.
- **Assets:** 8 curated yoga photos localized into `public/images/` (no runtime external
  dep); self-hosted fonts in `app/fonts/` so the image builds with **no build-time network**.
- **Infra unchanged:** same namespace `aisucks`, image `aisucks-web:latest`, NodePort `30100`,
  Docker→registry→Jenkins pipeline. `Dockerfile.production` already copies `public/` +
  `.next/static`, so images + fonts ship in the standalone image.
- **Verified pre-deploy:** `npm run build` = success; standalone `node server.js` smoke test →
  page/health/`/images/hero-flow.jpg` (image/jpeg)/`/icon.svg`/self-hosted `.woff2` all HTTP 200.
  Desktop + mobile (390px) screenshots reviewed.
- **Deploy:** pushed to `main` → GitHub webhook → Jenkins **build #5 = SUCCESS** (build+push image,
  recreate `aisucks` namespace, apply deployment, rollout restart). Recreates the namespace torn
  down earlier today.
- **Verified live:** `kubectl get ns aisucks` → `Active`; deployment `2/2` pods Running; NodePort
  `30100` → `/api/health` `{"status":"ok"}`, `/` HTTP 200 with `<title>Kaya Yoga …</title>`,
  `/images/hero-flow.jpg` HTTP 200 `image/jpeg`.

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
