# ADR-0005: Docker Compose on a single VM for pilot; same-image promotion

**Status:** Accepted · 2026-07-21

## Context
Atlas must serve exactly one pilot customer reliably. The team is small; every unit of ops complexity
is stolen from product work. The prototype already containerizes all three components.

## Decision
All components ship as containers. Each environment (dev / staging / pilot-prod) is a Docker Compose
file in `infra/environments/`. Staging and pilot-prod are single VMs behind Caddy (automatic TLS).
Images are built once per merge, tagged by git SHA, and the **same image** is promoted from staging to
pilot-prod manually. Rollback = redeploy previous SHA.

## Consequences
- Deploys and rollbacks are one command, understandable by every team member.
- Reliability effort goes where it pays at this scale: tested backups/restore (WAL + nightly dumps,
  monthly restore drills), not orchestration.
- A hard ceiling exists (one box); accepted knowingly — M4 plans managed Postgres and a container
  platform when a measured limit is hit.

## Alternatives rejected
- **Kubernetes:** operational tax (upgrades, RBAC, networking) with zero benefit at one-customer scale.
- **Serverless/PaaS:** data-residency control and PostGIS + long-running import jobs fit awkwardly;
  revisit at M4.
- **Rebuild images per environment:** what you tested is then not what you shipped.
