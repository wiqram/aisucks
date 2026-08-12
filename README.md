# aisucks — Kickstand

Next.js app deployed on the private Minikube cloud, live at
**https://aisucks.qcguy.com**.

The product is **Kickstand**: peer-to-peer motorcycle rental. Owners release the days
they aren't riding, riders book by city/date/licence, and the platform carries the
insurance, the DVLA licence check and the rental agreement. "Autopilot" prices a
listing against local demand, season and weekend density, and screens riders, so a
bike earns while its owner is away.

Scaffolded from `~/IdeaProjects/step0/base-architecture-scaffold.md`, **web-only
variant**: there is deliberately **no database**. The fleet is a data module
(`lib/bikes.ts`) and the API routes are stubs that apply the real rules without
persisting anything. Add Postgres/Vault only if the product needs to store data.

## How it is put together

| Layer | Where | Notes |
|---|---|---|
| Domain types | `lib/types.ts` | Framework-free |
| Pricing, availability, earnings, Autopilot | `lib/pricing.ts` | Pure functions, no clock reads — `today` is always a parameter |
| Fleet data | `lib/bikes.ts` | Listing windows stored as day offsets and resolved against a supplied `today`, so the fleet never goes stale |
| Page sections | `components/*.tsx` | Server components except `Fleet`, `BookingSheet`, `HostCalculator` |
| Stub API | `app/api/{bikes,quote,bookings}` | Validates input, re-prices server-side, persists nothing |

Two rules the code holds to, both learned the hard way:

- **Nothing visible is gated behind JavaScript.** The whole fleet is in the
  server-rendered HTML; filters only narrow what is already there. `scripts/smoke.mjs`
  asserts the served HTML contains zero `opacity:0`.
- **The clock is read in exactly one place** (`lib/today.ts`). Everything else takes
  `today` as an argument, which keeps server render and client hydration in agreement
  and makes the pricing rules testable.

## Fonts

Self-hosted from `public/fonts` via `next/font/local` (Anton, Archivo, JetBrains
Mono — latin subsets, ~85 KB total). Deliberately **not** `next/font/google`: the
production image then builds with no outbound network beyond npm, and there is no
third-party request on first paint.

## Fixed facts for this app

| Thing | Value |
|---|---|
| Repo | `github.com/wiqram/aisucks` |
| Namespace | `aisucks` |
| Registry image | `container-registry.traderyolo.com/aisucks-web:latest` |
| NodePort | **`30100`** (verified free vs every `deployment.yaml`/`compiled*.yaml` + Jenkins 30380) |
| Dev port (local) | `3013` |
| Prod container port | `3000` |
| Domain (live) | `aisucks.qcguy.com` → Cloudflare → NPM → `172.16.238.2:30100` |
| Health probe | `GET /api/health` |

## Local dev

```bash
npm install
npm run dev          # http://localhost:3013
# or, containerised:
docker compose up --build web
```

## Tests

No test framework dependency — Node's built-in runner strips the TypeScript.

```bash
npm test         # unit tests: pricing, availability, earnings, Autopilot, fleet integrity
npm run typecheck
npm run lint
npm run build

# integration: boot the build, then assert against any base URL
npm start &
node scripts/smoke.mjs http://127.0.0.1:3013
node scripts/smoke.mjs https://aisucks.qcguy.com   # same assertions against prod
```

`scripts/smoke.mjs` imports `lib/` directly, so it checks the deployed API's prices
against the pricing module rather than against hardcoded numbers.

## Deploy to prod

Jenkins builds from the **pushed GitHub repo**, so commit AND push first.

```bash
git add -A && git commit -m "..." && git push
jenkins-deploy aisucks          # from ~/bin (once the Jenkins job exists — see below)
```

**Push-to-`main` auto-deploys.** A GitHub webhook (`repos/wiqram/aisucks/hooks` →
`https://jenkins.traderyolo.com/github-webhook/`, push events) fires the Jenkins job
`aisucks` on every push to `main` (the job has the *GitHub hook trigger for GITScm
polling* enabled). No manual trigger needed.

The `Jenkinsfile` runs two stages on the `kubernetes` cloud agent:
1. **Build & push** — `docker compose -f docker-compose-prod.yml build/push aisucks-web`
2. **Deploy** — `kubectl apply` namespace + deployment, then `rollout restart`/`status`
   (forces a fresh `:latest` pull and blocks on readiness).

## One-time platform registration (operator — I can't do these from here)

These live OUTSIDE the repo. Only #1 and #2 are needed to serve on the NodePort;
#3 adds the public HTTPS domain.

1. **Jenkins job** — Jenkins UI (`172.16.238.2:30380`, PV-backed): create a pipeline
   job named `aisucks` pointing at `github.com/wiqram/aisucks` + this `Jenkinsfile`;
   set a remote-build **token** (short form `aisucks`).
2. **Cold-boot trigger row** — add `aisucks aisucks build <token>` to
   `~/IdeaProjects/step0/jenkins-jobs.manifest` and a `trigger aisucks` line in
   `trigger-app-builds.sh` (agents assemble the URL via `jenkins-deploy-url.sh`;
   never hardcode the token).
3. **Public domain (optional, when you want HTTPS)** —
   - **DNS**: point `aisucks.qcguy.com` A-record at the host's public IP.
   - **NPM proxy host** (admin UI `172.16.238.10:81`, MariaDB-backed — UI/API only):
     new proxy host `aisucks.qcguy.com` → forward `172.16.238.2:30100`,
     scheme `http`, **SSL forced + request a Let's Encrypt cert** (HTTP-01).

No Vault policy/age-key/role is needed for this web-only app (no secrets). Add them
(scaffold §4 steps 1–3) only when the business idea introduces secrets or a database.

## Verify after deploy

```bash
kubectl -n aisucks get po                 # aisucks-web pods Running
curl -s http://172.16.238.2:30100/api/health   # {"status":"ok",...}
# once DNS + NPM are set:
curl -sI https://aisucks.qcguy.com # 200
```

## Growing this into the real product

Everything is staged so only `app/` changes for pure-frontend features. When data
or secrets enter the picture, follow `base-architecture-scaffold.md`:
add a `migrator` stage to `Dockerfile.production`, a Postgres Deployment +
ClusterIP Service + hostPath PV + migrate Job to `deployment.yaml`, the
`vault/` SOPS secrets, `serviceAccountName: vault-secrets` + inject annotations on
the web pod, and the `Refresh Vault secrets` Jenkins stage.
