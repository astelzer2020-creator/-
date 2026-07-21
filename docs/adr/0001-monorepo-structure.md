# ADR-0001: Monorepo with apps / services / packages / infra

**Status:** Accepted · 2026-07-21

## Context
The prototype grew as loose top-level folders (`frontend/`, `backend/node`, `backend/python`, `mobile/`)
with no shared code, duplicated domain logic (taba column mapping exists in three places), and no
dependency rules. Atlas has multiple deployables that must share domain types and standards.

## Decision
One repository, structured as: `apps/` (deployable clients + the public API), `services/` (internal
backend services), `packages/` (shared non-deployable code, pnpm workspaces), `infra/` (Docker +
environments), `docs/`. Dependency direction is enforced: apps depend on packages; nothing depends on apps.

## Consequences
- One PR can change a contract and every consumer atomically; one CI covers everything.
- Shared vocabulary (types, schemas, i18n, column mappings) exists exactly once in `packages/shared`.
- Requires workspace tooling (pnpm) and CI path-filtering as the repo grows.

## Alternatives rejected
- **Polyrepo:** contract drift between web/api/mobile at pre-pilot pace is a killer; coordination cost
  dwarfs any isolation benefit for a small team.
- **Keep the prototype's flat layout:** no place for shared code; already produced triplication.
