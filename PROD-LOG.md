# Prod change log — aisucks

Running record of functionality successfully pushed to prod. Append a dated entry
**after every change is verified live** (pod Running + endpoint responding). Newest first.

Convention per entry: `## YYYY-MM-DD — <what shipped>` then bullets for *what* changed
and *how it was verified* (kubectl status, curl of NodePort `172.16.238.2:30100` and/or
`https://aisucks.predictonomy.com`).

---

<!-- No prod deploys yet. The bare-bones scaffold ("AI Sucks!" page) is built and
     locally verified but has not been pushed to main / deployed to the cluster.
     First entry gets added when the first change is confirmed live in prod. -->
