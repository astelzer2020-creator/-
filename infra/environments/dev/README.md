# dev environment — Postgres + API

How to run the Atlas API against a real local Postgres (ATL-022). Names only
in `.env.template` — never commit values (docs/SECURITY.md).

## 1. Postgres

Any Postgres 16 works. Two supported paths:

**Docker (when a daemon is available):**

```sh
docker run -d --name atlas-pg -p 5432:5432 \
  -e POSTGRES_USER=atlas -e POSTGRES_PASSWORD=<choose> -e POSTGRES_DB=atlas \
  postgres:16
```

**Local server binaries (no Docker) — scratch cluster:**

```sh
PGBIN=/usr/lib/postgresql/16/bin        # adjust to your install
PGDATA=$HOME/.atlas/pgdata
$PGBIN/initdb -D "$PGDATA" -U atlas --auth=trust -E UTF8
$PGBIN/pg_ctl -D "$PGDATA" -o "-p 54329 -c listen_addresses=127.0.0.1" \
  -l "$PGDATA/pg.log" start
$PGBIN/createdb -h 127.0.0.1 -p 54329 -U atlas atlas
$PGBIN/createdb -h 127.0.0.1 -p 54329 -U atlas atlas_test   # for integration tests
# when done: $PGBIN/pg_ctl -D "$PGDATA" stop
```

Trust auth is acceptable ONLY for a loopback-bound scratch cluster on a dev
machine. The database is never internet-facing (docs/SECURITY.md).

## 2. Migrate

Forward-only SQL migrations live in `apps/api/migrations/*.sql`, tracked in
the `schema_migrations` table:

```sh
DATABASE_URL=postgresql://atlas@127.0.0.1:54329/atlas \
  pnpm --filter @atlas/api migrate
```

Re-running is a no-op (idempotent). The runner applies each pending file in
its own transaction under an advisory lock.

## 3. Run the API

Copy `.env.template` values into your shell/env manager and start:

```sh
DATABASE_URL=... JWT_SECRET=... ANALYTICS_URL=... SEED_USER_PASSWORD=... \
  pnpm --filter @atlas/api build && pnpm --filter @atlas/api start
```

- `DATABASE_URL` set → pg repositories + pg user store; `/readyz` pings the DB;
  data survives restarts.
- `DATABASE_URL` unset → in-memory adapters (M1 behavior); nothing persists.
- `SEED_USER_PASSWORD` set → idempotently seeds TWO orgs (QA-M1-3):
  org A `admin@atlas.local` / `analyst@atlas.local` / `viewer@atlas.local`,
  org B `analyst-b@atlas.local` — all with that password. Unset → no users,
  login impossible (safe default).

## 4. Integration tests (real Postgres)

The pg suite (`apps/api/test/pg.integration.test.ts`) runs only when
`DATABASE_URL_TEST` is set, and TRUNCATES that database between tests — use a
dedicated test DB:

```sh
DATABASE_URL_TEST=postgresql://atlas@127.0.0.1:54329/atlas_test \
  pnpm --filter @atlas/api test
```

Without `DATABASE_URL_TEST` the suite is skipped, so CI runners without
Postgres stay green.
