# Atlas — Folder Structure

```
.
├── apps/                      # Deployable user-facing applications
│   ├── web/                   # React 18 + TypeScript + Vite SPA (RTL Hebrew-first)
│   ├── mobile/                # Expo (React Native) app — revived post-pilot
│   └── api/                   # Node 20 + TypeScript + Fastify — the ONLY public API
├── services/                  # Internal backend services (never internet-facing)
│   └── analytics/             # Python 3.12 + FastAPI financial engine (IRR/NPV/sensitivity)
├── packages/                  # Shared, non-deployable code (pnpm workspaces)
│   ├── shared/                # Domain types, Zod schemas, taba column mappings, i18n resources
│   └── config/                # Shared tsconfig / ESLint / Prettier presets
├── infra/
│   ├── docker/                # Dockerfiles per app/service
│   └── environments/          # Compose files + env templates per environment (dev/staging/pilot-prod)
├── docs/
│   ├── adr/                   # Architecture Decision Records (numbered, immutable)
│   ├── pilot/                 # Pilot-customer readiness pack (tech, product, growth, QA)
│   └── *.md                   # Architecture, roadmap, standards, strategies
├── .github/workflows/         # CI/CD pipelines
│
│   # ─── Legacy prototype (frozen; reference for M1–M2 porting; removed after M2) ───
├── frontend/                  # Prototype React app
├── backend/                   # Prototype Express + FastAPI
├── mobile/                    # Prototype Expo app
└── data/sample/               # Sample taba CSV fixtures (kept — used as test fixtures)
```

## Internal layout conventions

### `apps/api`
```
src/
├── app.ts                # Fastify instance wiring (no listen — testable)
├── server.ts             # Entry point: config load, listen
├── config/               # Env schema + typed config (fails fast at boot)
├── modules/<domain>/     # Feature modules: routes.ts, service.ts, repo.ts, schemas.ts
│   ├── projects/
│   ├── scenarios/
│   ├── imports/
│   └── auth/
├── plugins/              # Fastify plugins (db, auth, logging)
└── lib/                  # Cross-module helpers (no business logic)
migrations/               # SQL migrations, forward-only
test/                     # Mirrors src/ structure
```

### `services/analytics`
```
src/atlas_analytics/
├── main.py               # FastAPI app
├── api/                  # Routers + request/response models (Pydantic)
├── engine/               # Pure computation: irr.py, npv.py, sensitivity.py — no I/O
└── settings.py           # Pydantic Settings
tests/
├── golden/               # Hand-verified spreadsheet fixtures (the truth for financials)
└── ...
```

### `apps/web`
```
src/
├── app/                  # Router, providers, layout shell
├── features/<domain>/    # Feature folders: components, hooks, api calls per domain
├── components/           # Shared presentational components only
├── lib/                  # API client, formatting (₪, Hebrew dates), utils
└── i18n/                 # Imports resources from packages/shared
```

## Rules

1. **Dependency direction:** `apps/*` → `packages/*`. Never app→app, never `packages/*` → `apps/*`.
   `services/analytics` shares nothing at code level with the TS workspace — its contract is its OpenAPI schema.
2. **Feature-module organization,** not layer folders (`controllers/`, `models/` graveyards are banned).
   Everything about projects lives in `modules/projects/`.
3. **Tests live with their workspace,** mirroring the source layout.
4. **The legacy prototype is read-only.** No fixes land in `frontend/`, `backend/`, `mobile/`; code is
   ported out of it, never into it (see ADR-0007).
5. **No binaries or archives in git.** The zip/exe files currently at root predate this rule and are
   flagged for removal (see ADR-0008); `.gitignore` now blocks new ones.
