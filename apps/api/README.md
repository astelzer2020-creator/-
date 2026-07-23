# apps/api

Node 22 + TypeScript + Fastify 5 — Atlas's single public API (ADR-0002). Layout per
docs/FOLDER_STRUCTURE.md: `src/app.ts` (buildApp, no listen), `src/server.ts` (config + listen),
`src/plugins/` (error envelope, auth), `src/modules/<domain>/` (auth, projects, scenarios).

- **Auth:** JWT HS256 access tokens (15 min), roles `admin`/`analyst`/`viewer`; every route
  declares its role in `config.auth` and undeclared routes fail closed (docs/SECURITY.md).
- **Persistence (ATL-022):** with `DATABASE_URL` set the API runs on Postgres — pg repositories,
  pg user store (argon2id hashes in the `users` table), `/readyz` pings the DB, data survives
  restarts. Migrations are forward-only SQL files in `migrations/` applied by
  `pnpm --filter @atlas/api migrate` (tracked in `schema_migrations`, idempotent). Without
  `DATABASE_URL` the in-memory adapters serve dev/tests; nothing persists. Driver is `pg`
  (node-postgres) — the canonical minimal Postgres client: parameterized queries + pooling, no
  ORM/schema magic, so org-scoped SQL stays explicit in every repository statement
  (docs/SECURITY.md). Agorot are stored as `BIGINT` and parsed to JS numbers with a
  safe-integer bound check (`src/db/pool.ts`) — overflow throws rather than corrupting money.
- **Seeding (dev/pilot-UAT only):** when `SEED_USER_PASSWORD` is set, boot idempotently seeds TWO
  orgs (QA-M1-3 live cross-tenant probing): org A `admin`/`analyst`/`viewer@atlas.local`, org B
  `analyst-b@atlas.local`. Unset → no users, login impossible (safe default). See
  `infra/environments/dev/README.md` for the full dev flow.
- **Analytics:** `POST /projects/:id/scenarios/:sid/simulate` calls the internal analytics service
  (`ANALYTICS_URL`); when unreachable the API returns `503 ANALYTICS_UNAVAILABLE` — local fallback
  computation is banned.

Env (zod-validated at boot): `PORT`, `HOST`, `ANALYTICS_URL`, `JWT_SECRET` (≥32 chars),
`DATABASE_URL` (optional — unset falls back to in-memory), `SEED_USER_PASSWORD` (optional,
dev/pilot seeding). Tests: `DATABASE_URL_TEST` gates the real-Postgres integration suite
(`test/pg.integration.test.ts`); unset → suite skips so CI without Postgres stays green.

See docs/ARCHITECTURE.md and docs/SECURITY.md.
