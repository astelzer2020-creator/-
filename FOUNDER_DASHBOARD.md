<!-- GENERATED FILE — do not edit by hand. Regenerate with `pnpm dashboard`
     (tools/founder-dashboard/generate.mjs). CI enforces freshness (DL-013). -->

# Atlas — Founder Control Center

_Generated from repo sources at commit `be7add2` · coordination data as of **2026-07-23** (last `docs/coordination` commit) · ATL-021 / DL-013_

## 1. EXECUTIVE

| Item | Value |
|---|---|
| Current sprint | Sprint-1 (2026-07-21 → +1 week) |
| Sprint progress | 5 of 12 sprint tasks at IMPLEMENTED/VERIFIED (CLOSED: 1 · IMPLEMENTED: 1 · READY: 7 · VERIFIED: 3) |
| Production score | 8/10 (production-readiness, docs/coordination/AGENT_WORKBOARD.md) |
| Pilot readiness | Not ready — M1 in-progress — slice verified 2026-07-21, M2 planned, M3 planned; 2 Founder decision(s) pending |
| Current version | pre-release @ be7add2 (last source commit; no git tags yet) |
| Estimated pilot date | not yet schedulable — gated on: ATL-008 (archive deletion decision on docs/CLEANUP_REPORT.md); GITLEAKS_LICENSE / secrets-scan wiring (DL-009). M1 kickoff green-light RECEIVED (DL-014); M1 in-progress — slice verified 2026-07-21; M2 planned |

**Founder decisions pending:**

- ATL-008 (archive deletion decision on docs/CLEANUP_REPORT.md)
- GITLEAKS_LICENSE / secrets-scan wiring (DL-009). M1 kickoff green-light RECEIVED (DL-014)

## 2. TEAM

| Agent | Sprint task(s) | Status | Blocked | Backlog (frozen) | Completed | Total on board |
|---|---|---|---|---|---|---|
| CEO | ATL-001 (IMPLEMENTED) | Waiting | 0 | 0 | 1 | 1 |
| CTO | ATL-003-PLAN (CLOSED), ATL-003 (VERIFIED), ATL-020 (VERIFIED), ATL-021 (VERIFIED), ATL-022 (READY), ATL-023 (READY), ATL-024 (READY) | Ready | 1 | 2 | 6 | 12 |
| Product | ATL-013 (READY), ATL-014 (READY) | Ready | 0 | 1 | 1 | 4 |
| Growth | ATL-019 (READY) | Ready | 0 | 0 | 1 | 2 |
| QA | ATL-018 (READY) | Ready | 2 | 0 | 1 | 4 |

_Execution-worker tasks (not agent-owned): ATL-016 (Grok, BACKLOG), ATL-017 (Codex, BACKLOG)._

## 3. ENGINEERING

| Item | Value |
|---|---|
| Open P0 tasks | 2 — ATL-005, ATL-022 |
| Open P1 tasks | 7 — ATL-006, ATL-013, ATL-014, ATL-018, ATL-019, ATL-023, ATL-024 |
| Open P2 tasks | 6 — ATL-008, ATL-011, ATL-012, ATL-015, ATL-016, ATL-017 |
| Build & tests | pnpm lint PASS · pnpm typecheck PASS · pnpm test PASS · uv run pytest PASS · pnpm lint PASS · pnpm typecheck PASS · pnpm test PASS · uv run pytest PASS — QA evidence of 2026-07-21 (ATL-010). Live check: run `pnpm test`. |
| Coverage | n/a — placeholder suites until M1; coverage floors defined in docs/TESTING_STRATEGY.md (source not yet in repo: real test suites land with M1 code) |
| Performance | n/a pre-M1 — source not yet in repo (performance evidence lands with the M1 staging deploy per docs/ROADMAP.md) |
| Security | secrets-scan decorative (QA-M0-2, S3): CI secrets-scan job is a no-op that reports green. Disclosed in comments, but branch prot… · R-09 Open (Medium/Medium) — Founder decision pending (DL-009) |

## 4. PRODUCT

| Item | Value |
|---|---|
| Customer journey | docs/pilot/FIRST_VALUE_JOURNEY.md exists — 9-step first-value journey mapped ("raw project data → trusted Hebrew feasibility PDF in under 30 minutes") |
| Onboarding | ATL-013 (Week-0 data dry-run runbook): READY |
| Activation | 7 activation metrics dispositioned (docs/pilot/FIRST_VALUE_JOURNEY.md §4): 1 instrumentable in M1, 4 in M2, 2 manual-only. Instrumentation spec ATL-011: BACKLOG (frozen, DL-012) |
| Feature completion | M0: 3/5 · M1: 0/6 · M2: 0/5 · M3: 0/4 · M4: 0/0 (directional, no checklist) (docs/ROADMAP.md checklists) |
| UX status | 25 UI component file(s) present in apps/web/src |

## 5. BUSINESS

| Item | Value |
|---|---|
| Pilot customers | 0 live prospects — docs/growth/PIPELINE.md is plan-stage (status: DRAFT — internal plan); no prospect log section exists yet. Stage targets: Identified 20, Intro 10, Discovery 6, Data dry-run scheduled 3, Pilot agreed 1 primary + 2 queued |
| Pricing | HYPOTHESIS (DL-005, 2026-07-21): Pilot offer = free 8-week design-partner with hard end date, traded for feedback commitment, case-study rights, week-7 conversion conversation — revisit: Pricing validation, week 6 |
| Demo status | OUTLINE ONLY — gated: no live demo until QA verification + ATL-006 capability matrix (binding gate in the doc) |
| Sales material | DEMO_OUTLINE.md: OUTLINE ONLY [claims-gated] · PILOT_OFFER.md: DRAFT — internal structure, not yet an external document [claims-gated] · PIPELINE.md: DRAFT — internal plan [claims-gated] |
| Documentation | 11 strategy/docs files (docs/*.md) · 10 ADRs · 5 pilot docs · 10 coordination files · 3 growth docs |

## 6. RISKS

_Source: docs/coordination/RISK_REGISTER.md (every row rendered; category mapping is presentation-only)._

### Technical

| ID | Severity / Probability | Status | Mitigation (summary) |
|---|---|---|---|
| R-02 | High / Medium | Open | Golden fixtures built from prototype outputs BEFORE porting (ADR-0006); QA reconciliation gate |
| R-01 | Medium / Medium | Mitigated (residual: remote CI observation) | ATL-007 delivered 2026-07-21 and QA-verified (ATL-010: PASS-WITH-KNOWN-ISSUES; 48s local toolchain vs 10-min gate). Residual: first remote… |
| R-03 | Medium / Medium | Open | Org-ID scoping at repository layer from day one (SECURITY.md); QA cross-tenant probes |

### Security

| ID | Severity / Probability | Status | Mitigation (summary) |
|---|---|---|---|
| R-06 | High / Low | Open | SECURITY.md controls; no customer data in repo/fixtures; deletion commitments; incident playbook |
| R-09 | Medium / Medium | Open | Escalated to human owner via DL-009 (GITLEAKS_LICENSE or alternative scanner); until decided, treat secrets hygiene as convention-only and… |

### Product

| ID | Severity / Probability | Status | Mitigation (summary) |
|---|---|---|---|
| R-04 | High / High | Open | Week-0 data dry-run gates kickoff (PILOT_ONBOARDING.md); import validation report; fixture library grown from every failure |

### Business

| ID | Severity / Probability | Status | Mitigation (summary) |
|---|---|---|---|
| R-05 | Medium / Medium | Open | Contractual weekly cadence + week-4 go/adjust checkpoint; second contact at customer |
| R-08 | Low / High (already true) | Open (awaiting human owner decision) | ADR-0007 freeze + M2 deletion; ATL-009 cleanup report delivered and QA-verified 2026-07-21 (21 archives → 4 unique payloads; all snapshots… |

### Process

| ID | Severity / Probability | Status | Mitigation (summary) |
|---|---|---|---|
| R-07 | Medium / Medium | Open | OPERATING_PROTOCOL collision rules; file-group ownership; git diff before edit. 2026-07-21: first real near-collision — ATL-021 CTO correct… |

---

_Every value above is parsed from a repo file, computed from git, or explicitly marked n/a with its future source. Regenerate: `pnpm dashboard`._
