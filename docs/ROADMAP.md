# Atlas — Roadmap

Phased rebuild from prototype to a pilot-ready production platform. Each milestone has an explicit
exit gate; we do not start the next milestone until the gate passes. Pilot-facing planning lives in
[`docs/pilot/`](pilot/).

## M0 — Foundation (structure, no features) ← *current*

Scaffolding, standards, and decisions before any feature code.

- [x] Monorepo structure (`apps/`, `services/`, `packages/`, `infra/`, `docs/`)
- [x] Architecture, coding standards, testing/deployment/security strategies documented
- [x] ADRs for all structural decisions
- [ ] Toolchain bootstrap: pnpm workspaces, TypeScript, ESLint/Prettier presets, uv + ruff for Python
- [ ] CI skeleton green on an empty build (lint + typecheck + test jobs)

**Exit gate:** a new contributor can clone, install, and run lint/test green in under 10 minutes.

## M1 — Core platform

The walking skeleton: one thin slice through every layer, deployed.

- [ ] `apps/api`: Fastify app, health endpoints, config validation, error envelope, request logging
- [ ] PostgreSQL + PostGIS via migrations (project + scenario tables)
- [ ] `services/analytics`: FastAPI service with the IRR/NPV/payback engine ported from the prototype **with golden-file tests first**
- [ ] Auth: email+password login, JWT sessions, roles (admin / analyst / viewer)
- [ ] `apps/web`: shell with routing, RTL Hebrew layout, auth flow
- [ ] Staging environment deployed via Docker Compose; CI deploys on merge to `main`

**Exit gate:** login → create project → run one hard-coded simulation → see a number, on staging.

## M2 — The pilot workflow

The single end-to-end flow the pilot customer needs (see [pilot/PILOT_SCOPE.md](pilot/PILOT_SCOPE.md)).

- [ ] Taba/PIO import: CSV/XLSX (Windows-1255) / GeoJSON with column mapping, validation report, dedup by מספר תיק
- [ ] Scenario builder: apartment mix, costs, prices; full ROI results (IRR, NPV, payback, sensitivity)
- [ ] Project dashboard + Leaflet map
- [ ] Report export: executive summary + cashflow (PDF, XLSX) with correct RTL rendering
- [ ] Pilot QA suite from [pilot/QA_PLAN.md](pilot/QA_PLAN.md) passing

**Exit gate:** import a real customer file → simulate → export a correct Hebrew PDF, with zero manual intervention.

## M3 — Pilot launch and hardening

- [ ] Pilot-prod environment, backups with tested restore (RPO/RTO per [pilot/TECHNICAL_READINESS.md](pilot/TECHNICAL_READINESS.md))
- [ ] Monitoring + alerting minimum; on-call/incident routine for a small team
- [ ] Security pass: dependency audit, secrets scan, authZ review of every endpoint
- [ ] Onboard pilot customer per [pilot/PILOT_ONBOARDING.md](pilot/PILOT_ONBOARDING.md)

**Exit gate:** pilot customer actively using Atlas weekly on their own data; go/no-go checklist green.

## M4 — Post-pilot (directional, re-planned after pilot feedback)

- 3D before/after view (ported from prototype), mobile app (Expo) revival
- Multi-tenant readiness, billing, additional data sources (רמ"י / נדל"ן ממשלתי feeds)
- Scale-out deployment (managed Postgres, container platform) per [DEPLOYMENT.md](DEPLOYMENT.md)

## What we deliberately do NOT do before the pilot

- No microservice split beyond the two services that exist for language reasons
- No Kubernetes, no multi-region, no SSO/SAML
- No feature work on 3D/mobile until the core money-question workflow (import → simulate → report) is trusted
