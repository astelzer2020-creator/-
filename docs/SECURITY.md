# Atlas — Security Strategy

Atlas holds a pilot customer's commercially sensitive real-estate feasibility data. The threat model at
pilot stage is not nation-state attackers; it is credential theft, an exposed internal service, a leaked
file, and careless data handling. The strategy targets those first.

## Authentication & authorization

- Email + password with Argon2id hashing; JWT access tokens (15 min) + rotating refresh tokens
  (httpOnly, Secure, SameSite=Strict cookies). No third-party SSO until after the pilot.
- Roles: `admin` (user management), `analyst` (create/edit projects & scenarios), `viewer` (read + export).
- **Every** API route declares its required role explicitly; an undeclared route fails closed. AuthZ is
  enforced server-side per request — never by hiding UI.
- All data access is scoped by organization ID at the repository layer (single-tenant per deployment for
  the pilot, but the scoping is built now so multi-tenancy later is a config change, not a rewrite).

## Network posture

- Only the reverse proxy is internet-facing (TLS via Caddy, HSTS). `services/analytics` and PostgreSQL sit
  on an internal Docker network with no published ports — fixing the prototype's design flaw of two
  public APIs.
- CORS locked to the web app's origin. Standard headers: CSP, X-Content-Type-Options, frame-ancestors 'none'.

## Input handling (the domain-specific attack surface)

File import is the largest attack surface. Rules:
- Uploads: allowlist of extensions AND magic-byte check; size caps; parsed in a worker with timeouts
  (xlsx zip-bombs, CSV formula injection `=cmd|...` — exported cells are always prefixed/escaped).
- Every parsed row is validated by schema before touching the database; parameterized queries only.
- Uploaded files stored in object storage under generated names, never on an executable path, never
  served back with their original Content-Type unverified.

## Secrets & configuration

- No secrets in git — enforced by secret scanning in CI (gitleaks) on every PR.
- Secrets live in the deploy host's secret store; injected as env vars; rotated on any suspicion and on
  team offboarding. `.env.template` files document names only.

## Data protection & privacy

- Customer plan data is subject to the Israeli **Privacy Protection Law (חוק הגנת הפרטיות)** including
  Amendment 13 (in force since Aug 2025): defined data region (EU/Israel), documented processing purpose,
  deletion on request and at pilot end (verified, including backups' expiry), no customer data in
  logs, analytics events, or test fixtures — ever.
- Encryption in transit everywhere (TLS 1.2+); disk/volume encryption on the pilot-prod host; backups
  encrypted at rest.

## Supply chain & CI

- Dependencies pinned via lockfiles; Dependabot/`npm audit`/`pip-audit` weekly; a critical advisory on a
  runtime dependency blocks release.
- Containers run as non-root, minimal base images, no build tools in final stages.
- CI has least-privilege tokens; deploy credentials exist only in the deploy job's environment.

## Process

- Security review is part of QA's release gate (see `.claude/agents/atlas-qa.md`): authZ probe of every
  new endpoint, dependency audit, secrets scan — release blocks on failure.
- Incident playbook (kept in pilot/TECHNICAL_READINESS.md): contain → assess data exposure → notify the
  pilot customer honestly and fast → post-mortem in the decision log.
- Deferred until post-pilot, deliberately: SOC 2, penetration test by an external firm, SSO/SAML, WAF.
