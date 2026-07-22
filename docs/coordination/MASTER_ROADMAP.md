# Atlas — Master Roadmap (live)

Live, owned view of [docs/ROADMAP.md](../ROADMAP.md). CEO maintains this file; the strategy narrative
stays in ROADMAP.md. Status values: `planned | in-progress | blocked | done | verified`.

## Milestones

### M0 — Foundation (structure, standards, operating system)
- **Objective:** repo scaffolded, all strategies documented, agent operating model installed, CI green on empty build.
- **Owner:** atlas-ceo (orchestration) / atlas-cto (toolchain)
- **Dependencies:** none
- **Acceptance criteria:** new contributor clones → installs → lint/test green in <10 min; `/agents` lists all five Atlas agents; every structural decision has an ADR.
- **Status:** done pending remote-CI observation (ATL-007 delivered + QA PASS-WITH-KNOWN-ISSUES via ATL-010, 2026-07-21; 48s local setup vs 10-min gate; `verified` when the first remote CI run is observed green — QA-M0-3)
- **Risks:** R-01
- **Release gate:** none (no user-facing release)

### M1 — Core platform (walking skeleton)
- **Objective:** login → create project → run one simulation → see a number, on staging.
- **Owner:** atlas-cto · **Reviewer:** atlas-qa
- **Dependencies:** M0
- **Acceptance criteria:** per docs/ROADMAP.md M1 checklist; golden-file suite green for ported engine.
- **Status:** in-progress — **slice verified 2026-07-21** (ATL-003 QA verdict PASS-WITH-KNOWN-ISSUES → VERIFIED slice-scoped, DL-015; in-memory persistence stopgap — data does not survive restart). **M1 completion = ATL-022 (Postgres persistence live) + ATL-023 (web non-demo mapping) + ATL-024 (green remote CI), each QA re-verified.** Pilot-readiness 6/10 per QA; "pilot-ready" claim blocked until completion.
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
[AGENT_WORKBOARD.md](AGENT_WORKBOARD.md) as ATL-001…ATL-015. **First delivery cycle complete
(2026-07-21):** ATL-002 done (reviewed), ATL-004 done (reviewed, ACCEPT-WITH-CHANGES applied),
ATL-007 done (QA PASS-WITH-KNOWN-ISSUES), ATL-009 verified, ATL-010 done. M0 is done pending
remote-CI observation (QA-M0-3). **ATL-003 is now UNBLOCKED** (ATL-007 delivered + QA-passed) and is
the next engineering task, awaiting green-light per roadmap sequencing (MISSION-1 next phase, human
owner). Open on the human owner: ATL-008 archive-deletion approval (DL-010) and the
GITLEAKS_LICENSE/secrets-scan decision (DL-009). Gap tasks ATL-011…ATL-015 filed from ATL-002;
ATL-013/ATL-014 (P1, Product-owned) can start immediately.

**Sprint-1 defined (2026-07-21, DL-012; amended by DL-013 and DL-014):** P0/P1 only — ATL-001
(IMPLEMENTED, Founder sign-off pending), ATL-013, ATL-014, ATL-018, ATL-019, ATL-020 (VERIFIED),
ATL-021 (VERIFIED — QA-S1-1 confirmed-fixed at bc52714), plus **ATL-003 implementation** which joined
the sprint via the DL-014 Founder direct green-light and is now **VERIFIED slice-scoped** (QA
PASS-WITH-KNOWN-ISSUES, DL-015). ATL-003-PLAN is CLOSED — superseded by DL-014. All P2/P3 work stays
frozen. **Sprint-1 exit condition:** all Sprint-1 tasks (incl. the three ATL-003 work packages)
IMPLEMENTED/VERIFIED with evidence, plus Founder rulings received on ATL-008 (DL-010) and
GITLEAKS/secrets-scan (DL-009).

**M1 delivery cycle consolidated (2026-07-21, DL-015):** ATL-003 delivered (commits 8c37779…f1fc530)
and QA-verified for its claimed slice — 84 TS + 39 pytest green, golden fixtures independently
re-derived, live e2e smoke with hand-verified numbers, zero wrong financial numbers. Remaining gap to
M1 completion filed as **ATL-022 (Postgres persistence live, P0 — recommended next task), ATL-023
(web non-demo mapping, P1), ATL-024 (green remote CI + prettier gate, P1)** — all READY, owner
atlas-cto, reviewer atlas-qa. M2 pilot-workflow work starts only after these three verify. Founder
snapshot: docs/coordination/FOUNDER_STATUS_REPORT.md (live view: FOUNDER_DASHBOARD.md).
