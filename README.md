# aisucks

Bare-bones Next.js app deployed on the private Minikube cloud. Right now it just
renders **"AI Sucks!"** in large font — the entire deploy architecture (Docker →
`container-registry.traderyolo.com` → Jenkins → Minikube NodePort) is wired around
it. When the business idea is decided, it gets built on top of `app/page.tsx`.

Scaffolded from `~/IdeaProjects/step0/base-architecture-scaffold.md`, **web-only
variant** (no Postgres / Vault / migrate yet — added when the idea needs data).

## Fixed facts for this app

| Thing | Value |
|---|---|
| Repo | `github.com/wiqram/aisucks` |
| Namespace | `aisucks` |
| Registry image | `container-registry.traderyolo.com/aisucks-web:latest` |
| NodePort | **`30100`** (verified free vs every `deployment.yaml`/`compiled*.yaml` + Jenkins 30380) |
| Dev port (local) | `3013` |
| Prod container port | `3000` |
| Domain (planned) | `aisucks.predictonomy.com` → NPM → `172.16.238.2:30100` |
| Health probe | `GET /api/health` |

## Local dev

```bash
npm install
npm run dev          # http://localhost:3013
# or, containerised:
docker compose up --build web
```

## Deploy to prod

Jenkins builds from the **pushed GitHub repo**, so commit AND push first.

```bash
git add -A && git commit -m "..." && git push
jenkins-deploy aisucks          # from ~/bin (once the Jenkins job exists — see below)
```

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
   - **DNS**: point `aisucks.predictonomy.com` A-record at the host's public IP.
   - **NPM proxy host** (admin UI `172.16.238.10:81`, MariaDB-backed — UI/API only):
     new proxy host `aisucks.predictonomy.com` → forward `172.16.238.2:30100`,
     scheme `http`, **SSL forced + request a Let's Encrypt cert** (HTTP-01).

No Vault policy/age-key/role is needed for this web-only app (no secrets). Add them
(scaffold §4 steps 1–3) only when the business idea introduces secrets or a database.

## Verify after deploy

```bash
kubectl -n aisucks get po                 # aisucks-web pods Running
curl -s http://172.16.238.2:30100/api/health   # {"status":"ok",...}
# once DNS + NPM are set:
curl -sI https://aisucks.predictonomy.com # 200
```

## Growing this into the real product

Everything is staged so only `app/` changes for pure-frontend features. When data
or secrets enter the picture, follow `base-architecture-scaffold.md`:
add a `migrator` stage to `Dockerfile.production`, a Postgres Deployment +
ClusterIP Service + hostPath PV + migrate Job to `deployment.yaml`, the
`vault/` SOPS secrets, `serviceAccountName: vault-secrets` + inject annotations on
the web pod, and the `Refresh Vault secrets` Jenkins stage.
