# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status, curl of NodePort `172.16.238.2:30100` and/or
`https://aisucks.predictonomy.com`).

---

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
