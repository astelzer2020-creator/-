# Atlas — Deployment Strategy

Principle: **the simplest thing that is reproducible, restorable, and boring.** One pilot customer does
not justify Kubernetes; it does justify migrations, backups, and one-command deploys.

## Environments

| Env | Purpose | Where | Data |
|---|---|---|---|
| `dev` | Local development | Docker Compose on the developer machine | Synthetic/sample only |
| `staging` | Integration + demo, auto-deployed from `main` | Single VM (Docker Compose) | Synthetic only |
| `pilot-prod` | The pilot customer | Single VM, EU/Israel region (data-residency, see SECURITY.md) | Real customer data |

Environment definitions live in `infra/environments/<env>/` — a compose file plus a committed
`.env.template` (names only, no values). Secrets are injected at deploy time from the host's secret
store, never committed.

## Build & release

- **Everything ships as a container.** Dockerfiles in `infra/docker/`, multi-stage, non-root user,
  pinned base images.
- CI builds images once per merge to `main`, tags them with the git SHA, pushes to the registry.
  **The same image** goes to staging automatically and to pilot-prod manually — no rebuild between
  environments.
- Deploy = `docker compose pull && docker compose up -d` driven by a script in `infra/`; rollback =
  redeploy the previous SHA tag. Target: rollback in under 5 minutes.
- Database migrations run as an explicit pre-deploy step, forward-only. A change that needs a rollback
  path ships as expand → migrate → contract across releases.

## Pipeline (GitHub Actions, skeleton in `.github/workflows/ci.yml`)

```
PR:        lint → typecheck → unit + integration → golden files → e2e (core loop)
merge to main:  all of the above → build images → deploy staging
release:   manual approval → deploy pilot-prod (same images)
```

`main` is protected: CI green + one review required. Anything on `main` is deployable by definition.

## Runtime topology (pilot scale)

One VM runs: reverse proxy (Caddy — automatic TLS) → `apps/api` → `services/analytics` (internal network
only) → PostgreSQL + PostGIS container with a mounted volume. `apps/web` is static files served by the
proxy. Object storage is an S3-compatible bucket, not a disk path.

## Backups & restore (the actual reliability feature)

- Nightly `pg_dump` + WAL archiving to object storage in a second location; uploaded files bucket versioned.
- **A backup that hasn't been restored is a rumor:** restore is rehearsed into staging monthly, timed,
  and logged. Targets: RPO ≤ 15 min (WAL), RTO ≤ 4 business hours (per pilot/TECHNICAL_READINESS.md).

## Observability minimum

- Structured JSON logs shipped off-box; Sentry (or equivalent) for error tracking on web + api + analytics.
- Uptime check on `/healthz` from an external service; alerts to the team channel.
- Metrics that matter for the pilot: import success rate, simulation latency, report-export failures.

## Explicitly deferred until after the pilot

Kubernetes/orchestration, autoscaling, multi-region, blue-green deploys, managed Postgres migration
(planned in M4), CDN. Each gets adopted when a measured limit is hit, not before.
