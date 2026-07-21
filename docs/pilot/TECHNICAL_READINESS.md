# Technical Readiness Plan — First Pilot Customer

**Owner:** CTO · **Status:** Draft for exec review · **Scope:** one pilot customer (יזם/חברת התחדשות עירונית), ~5–15 users, real תב"ע/פינוי-בינוי plan data.
**Bar:** pilot-grade, not enterprise-grade. We optimize for: their data is never lost, never leaked, and the app is up during Israeli business hours.

## 1. Definition of "technically ready for pilot" — Go/No-Go checklist

All items below are **blocking**. If any box is unchecked, we do not onboard.

- [ ] All pilot traffic served by the new stack (`apps/web`, `apps/api`, `services/analytics`); prototype (`frontend/`, `backend/`) reachable only on localhost/dev.
- [ ] **Single public API**: only `apps/api` is internet-facing; analytics service on a private network (ADR-0003).
- [ ] **Auth**: email+password login (bcrypt/argon2), JWT sessions, per-customer tenant scoping — every query filtered by `tenant_id`. No anonymous access to any data route.
- [ ] **Persistence**: all projects/scenarios/results in PostgreSQL+PostGIS via migrations (no in-memory state); uploaded files in object storage.
- [ ] **Backups**: nightly automated Postgres backup + one **verified restore drill** performed end-to-end.
- [ ] **HTTPS everywhere**, valid TLS cert, secrets in env/secret store — zero secrets in repo (audit done).
- [ ] **Import path proven** on the customer's real files: cp1255/UTF-8 CSV+XLSX with Hebrew headers round-trips correctly (no mojibake) through import → DB → report export.
- [ ] **Financial engine correctness**: IRR/NPV/payback validated against golden fixtures cross-checked in Excel; sign-off from the domain lead.
- [ ] **CI**: on every PR — typecheck, lint, unit tests (incl. analytics golden tests), Docker build. Main branch is deployable.
- [ ] `/healthz` + `/readyz` on api and analytics; uptime monitor + error alerting wired to the team (Slack/phone).
- [ ] Staging environment exists and the exact pilot deploy was exercised there first.
- [ ] One-page runbook: deploy, rollback, restore-from-backup, "site is down" steps.
- [ ] Signed DPA / data-handling terms with the pilot customer; data deletion path defined.

## 2. Environments and minimum infra

| Env | Purpose | Infra |
|---|---|---|
| **dev** | Local per-engineer | `docker compose up`: web, api, analytics, Postgres+PostGIS, MinIO. Seeded sample taba data. |
| **staging** | Rehearse deploys, demo internally | One small VM/managed container service, one managed Postgres (small tier). Anonymized/sample data only. |
| **pilot-prod** | The customer | One cloud region (eu-central/il-central for latency + data-locality comfort). Managed Postgres w/ PITR, S3-compatible bucket, api+analytics containers behind a load balancer/reverse proxy with TLS. |

Minimums, deliberately: **no** Kubernetes, **no** multi-AZ HA, **no** IaC framework beyond a documented setup script/compose file in `infra/`. Pilot-prod and staging are config-identical except size and secrets.

## 3. Gaps: prototype → pilot bar (prioritized)

| # | Gap (evidence) | Risk | Fix |
|---|---|---|---|
| P0 | **No persistence** — projects live in `let projects = []` (`backend/node/routes/projects.js`); restart = customer data gone | Fatal | Postgres schema + migrations in `apps/api`; object storage for uploads |
| P0 | **No auth / no tenancy** — every route is open | Fatal | JWT auth + `tenant_id` scoping; roles: admin/analyst/viewer only |
| P0 | **Dual public APIs** — browser calls Node :3001 *and* Python :8001 directly | Data exposure, no single choke point | All client traffic → `apps/api`; analytics internal-only |
| P1 | **No CI** — `.github/workflows/` is empty; `apps/*` scaffolding empty | Regressions ship silently | GitHub Actions pipeline (lint, test, build); analytics golden-fixture tests |
| P1 | **No backups / no managed DB** | Unrecoverable loss | Managed Postgres, PITR on, nightly snapshot + restore drill |
| P1 | **No validation layer** — API trusts request bodies | Corrupt financial results | Zod schemas in `packages/shared` on every write path |
| P2 | **No observability** — console logs only, no request IDs, no health endpoints | Blind during incidents | pino/structlog JSON logs, request-ID propagation api→analytics, `/healthz` `/readyz`, Sentry |
| P2 | **Hebrew/encoding handling scattered** per prototype file | Silent data corruption on import | Centralize cp1255 detection + column mapping in `packages/shared`; encoding test corpus |
| P3 | **Repo hygiene** — ~20 `urbanrenewal*.zip` archives and an `.exe` at repo root | Confusion, bloat | Delete before pilot branch cut |

## 4. Reliability targets (one pilot customer)

- **Uptime**: 99% measured over Israeli business hours (Sun–Thu 08:00–19:00 Asia/Jerusalem). Off-hours best-effort; maintenance windows announced, Fri/Sat preferred.
- **RPO (their plan data): ≤ 24h worst case via nightly snapshot; effectively ≤ 15 min with Postgres PITR enabled.** Raw uploaded files: zero loss (object storage is durable; never the only copy of a computed result's inputs).
- **RTO: ≤ 4 business hours** to restore service from total environment loss (documented, rehearsed restore).
- **No SLA in the pilot contract** — these are internal targets communicated as expectations, not penalties.

## 5. Monitoring, alerting, incident response (tiny team)

**Minimum kit** (buy, don't build):
- [ ] External uptime check (UptimeRobot/Better Stack) on `https://…/healthz` every 60s → phone push.
- [ ] Sentry (or equivalent) on web, api, analytics — new-error alerts to Slack.
- [ ] Infra alarms: Postgres disk >80%, backup-job failure, container restart loop.
- [ ] Structured logs retained 30 days, searchable (provider console is fine).

**Incident response for 2–4 engineers:**
- One **on-call phone rotation** during business hours; off-hours = best effort, checked next morning.
- Severity: **SEV1** down/data-loss/leak → drop everything, customer notified within 1h. **SEV2** degraded/one feature broken → same-day. **SEV3** → backlog.
- Runbook in `docs/pilot/RUNBOOK.md`: restart, rollback (previous image tag kept warm), restore-from-backup, who calls the customer (CTO).
- Post-SEV1/2: half-page blameless writeup within 48h.

## 6. Data protection basics (pilot customer's plan data)

Their תב"ע/PIO data is commercially sensitive real-estate deal data — treat leak = pilot-ending event.

- [ ] TLS in transit everywhere; encryption at rest on DB volumes and object storage (provider-managed keys are fine).
- [ ] Tenant isolation enforced in the API layer on every query; integration test that user A cannot read tenant B.
- [ ] Least-privilege access: prod DB/console access limited to 2 named engineers, MFA on all cloud/GitHub accounts, no shared credentials.
- [ ] **Hebrew integrity**: everything is UTF-8 at rest; cp1255 converted at the import boundary only. Automated test corpus with real Hebrew headers (`מספר תיק`, `יח"ד קיים`…), niqqud-free ordering, and RTL export checks (PDF/XLSX).
- [ ] Data locality: single stated region; documented in the DPA. Israeli Privacy Protection Law (חוק הגנת הפרטיות + תקנות אבטחת מידע) noted: pilot data is mostly plan/financial, minimal personal data — keep it that way (no owner ID numbers imported in the pilot).
- [ ] Deletion commitment: on pilot termination, purge tenant data + backups within 30 days, written confirmation.
- [ ] No customer data in dev/staging, in logs (log IDs, not payloads), or in LLM/third-party tools.

## 7. Explicitly deferred until after the pilot

- SSO/SAML, granular permissions beyond admin/analyst/viewer, audit-log UI.
- Multi-AZ HA, autoscaling, Kubernetes, multi-region, formal IaC (Terraform).
- SOC 2 / ISO 27001 certification work (keep practices certifiable, do not certify).
- Mobile app (`apps/mobile`) in production — demo-only during pilot; web is the pilot surface.
- Self-serve signup, billing, public API for customers, webhooks.
- Performance work beyond "sensitivity analysis returns in <10s for a 500-unit project".
- Deleting the prototype tree — stays as reference per ADR-0007, but firewalled from prod.

**Decision rule for scope fights:** if it doesn't protect the customer's data or keep the core loop (import → scenario → IRR/NPV → report) working, it waits.
