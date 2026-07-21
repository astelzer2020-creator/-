# apps/api

Node 22 + TypeScript + Fastify 5 — Atlas's single public API (ADR-0002). Layout per
docs/FOLDER_STRUCTURE.md: `src/app.ts` (buildApp, no listen), `src/server.ts` (config + listen),
`src/plugins/` (error envelope, auth), `src/modules/<domain>/` (auth, projects, scenarios).

- **Auth:** JWT HS256 access tokens (15 min), roles `admin`/`analyst`/`viewer`; every route
  declares its role in `config.auth` and undeclared routes fail closed (docs/SECURITY.md).
- **M1 stopgap:** users live in an in-memory store (argon2id-hashed), seeded only when
  `SEED_USER_PASSWORD` is set. Replaced by Postgres (`migrations/0001_init.sql` is written but not
  executed anywhere yet; the pg repo adapters throw `NOT_IMPLEMENTED`).
- **Analytics:** `POST /projects/:id/scenarios/:sid/simulate` calls the internal analytics service
  (`ANALYTICS_URL`); when unreachable the API returns `503 ANALYTICS_UNAVAILABLE` — local fallback
  computation is banned.

Env (zod-validated at boot): `PORT`, `HOST`, `ANALYTICS_URL`, `JWT_SECRET` (≥32 chars),
`DATABASE_URL` (optional for now), `SEED_USER_PASSWORD` (optional, dev/pilot stopgap).

See docs/ARCHITECTURE.md and docs/SECURITY.md.
