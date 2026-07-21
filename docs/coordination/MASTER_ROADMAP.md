# Atlas — Master Roadmap (live)

Live, owned view of [docs/ROADMAP.md](../ROADMAP.md). CEO maintains this file; the strategy narrative
stays in ROADMAP.md. Status values: `planned | in-progress | blocked | done | verified`.

## Milestones

### M0 — Foundation (structure, standards, operating system)
- **Objective:** repo scaffolded, all strategies documented, agent operating model installed, CI green on empty build.
- **Owner:** atlas-ceo (orchestration) / atlas-cto (toolchain)
- **Dependencies:** none
- **Acceptance criteria:** new contributor clones → installs → lint/test green in <10 min; `/agents` lists all five Atlas agents; every structural decision has an ADR.
- **Status:** in-progress (docs + agent system done; toolchain bootstrap ATL-007 open)
- **Risks:** R-01
- **Release gate:** none (no user-facing release)

### M1 — Core platform (walking skeleton)
- **Objective:** login → create project → run one simulation → see a number, on staging.
- **Owner:** atlas-cto · **Reviewer:** atlas-qa
- **Dependencies:** M0
- **Acceptance criteria:** per docs/ROADMAP.md M1 checklist; golden-file suite green for ported engine.
- **Status:** planned
- **Risks:** R-02, R-03
- **Release gate:** QA verdict PASS on skeleton E2E + security review of auth.

### M2 — Pilot workflow (import → simulate → report)
- **Objective:** real taba file → trusted Hebrew feasibility PDF, zero manual intervention.
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Criteria author:** atlas-product
- **Dependencies:** M1
- **Acceptance criteria:** the 11 scenarios in docs/pilot/QA_PLAN.md pass; reconciliation vs. customer spreadsheet <1% divergence (target from PILOT_SCOPE.md).
- **Status:** planned
- **Risks:** R-02, R-04
- **Release gate:** full pilot QA suite + security review; prototype deletion approved (ADR-0007).

### M3 — Pilot launch
- **Objective:** pilot customer onboarded and active weekly on their own data.
- **Owner:** atlas-ceo · with atlas-growth (onboarding), atlas-cto (pilot-prod), atlas-qa (go/no-go)
- **Dependencies:** M2; signed pilot agreement (human owner)
- **Acceptance criteria:** TECHNICAL_READINESS.md go/no-go checklist green; onboarding journey week-0 data dry-run passed.
- **Status:** planned
- **Risks:** R-05, R-06
- **Release gate:** joint QA+CEO go decision, logged in DECISION_LOG.md.

### M4 — Post-pilot (directional)
Re-planned after pilot feedback. Candidates: 3D view port, mobile revival, multi-tenancy, billing,
managed infrastructure. **Status:** planned (not decomposed).

## Current focus
**MISSION-1: Prepare Atlas for its first pilot customer** — decomposed on
[AGENT_WORKBOARD.md](AGENT_WORKBOARD.md) as ATL-001…ATL-010. **EXECUTING as of 2026-07-21** — human
owner kickoff approved (DECISION_LOG DL-007). Constraint: legacy assets untouched until the ATL-009
cleanup report is reviewed by the human owner; ATL-008 deletion stays blocked behind that review.
Delegated today: ATL-007+ATL-009 → atlas-cto, ATL-002 → atlas-product, ATL-004 (bounded scope) →
atlas-growth; ATL-010 (QA baseline verification) queued behind ATL-007 delivery.
