# Atlas — Agent Workboard (live)

One task = one owner + one reviewer (never the same agent). Nothing moves to `verified` without linked
QA evidence. Status: `ready | in-progress | blocked | done (unverified) | verified`.

## MISSION-1: Prepare Atlas for its first pilot customer

**EXECUTING as of 2026-07-21** — human owner kickoff approved (DECISION_LOG DL-007). Constraint: no
deletion/modification of legacy files, archives, or executables; cleanup report first (ATL-009), then
human review before ATL-008 acts.

---

### ATL-001 — Finalize pilot milestone priorities and sequencing
- **Owner:** atlas-ceo · **Reviewer:** human owner · **Priority:** P0
- **Status:** ready · **Dependencies:** none
- **Files affected:** docs/coordination/MASTER_ROADMAP.md, docs/ROADMAP.md
- **Acceptance criteria:** M1/M2/M3 decomposed into workboard tasks each with owner, reviewer, criteria; sequencing respects dependencies; human owner sign-off recorded in DECISION_LOG.
- **Verification evidence:** —

### ATL-002 — Verify onboarding and first-value journey
- **Owner:** atlas-product · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** in-progress (delegated to atlas-product 2026-07-21; see HANDOFFS.md) · **Dependencies:** ATL-001
- **Files affected:** docs/pilot/PILOT_SCOPE.md, docs/pilot/journey/*
- **Deliverable:** docs/pilot/FIRST_VALUE_JOURNEY.md + M2 acceptance criteria.
- **Acceptance criteria:** week-by-week first-value journey validated against PILOT_ONBOARDING.md; every step of "raw data → trusted Hebrew PDF in <30 min" has an owner (product feature or human process); gaps filed as workboard tasks; activation metrics instrumented-or-ticketed.
- **Verification evidence:** —

### ATL-003 — Resolve P0/P1 production issues (persistence, auth, single API, CI)
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Priority:** P0
- **Status:** ready (blocked on ATL-007 delivery) · **Dependencies:** ATL-001, ATL-007
- **Files affected:** apps/api/**, services/analytics/**, packages/shared/**, infra/**, .github/workflows/**
- **Acceptance criteria:** the four P0-fatal gaps from docs/pilot/TECHNICAL_READINESS.md closed — Postgres persistence with migrations; auth with roles; analytics internal-only behind the single public API; CI green gate. Each closed gap has QA verification evidence.
- **Verification evidence:** —

### ATL-004 — Create pilot offer and demo materials
- **Owner:** atlas-growth · **Reviewer:** atlas-product · **Priority:** P1
- **Status:** in-progress (delegated to atlas-growth 2026-07-21 with **BOUNDED SCOPE**: offer structure, pipeline plan, and demo outline only; NO capability claims until the ATL-006 capability matrix exists — any not-yet-verified item must be labeled "planned") · **Dependencies:** ATL-002 (journey), ATL-006 (verified capability list for claims audit — blocks the claims-bearing portion only)
- **Files affected:** docs/pilot/PILOT_ONBOARDING.md, docs/growth/*
- **Acceptance criteria:** pilot offer one-pager (8-week design-partner terms) ready for human owner review; demo script exercises only QA-verified flows; claims audit attached mapping every capability statement to evidence.
- **Verification evidence:** —

### ATL-005 — Independent critical-journey and security verification
- **Owner:** atlas-qa · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** ready (blocked on ATL-003 delivery) · **Dependencies:** ATL-003
- **Files affected:** docs/pilot/QA_PLAN.md (results), docs/coordination/AGENT_WORKBOARD.md (evidence links)
- **Acceptance criteria:** the 11 acceptance scenarios of QA_PLAN.md executed with recorded results; authZ probe of all endpoints incl. cross-tenant attempts; golden-file suite green; verdict + production-readiness score published.
- **Verification evidence:** —

### ATL-006 — Verified capability matrix
- **Owner:** atlas-qa · **Reviewer:** atlas-growth · **Priority:** P1
- **Status:** ready · **Dependencies:** ATL-005
- **Files affected:** docs/coordination/capability-matrix.md (new)
- **Acceptance criteria:** every prototype-claimed feature classified verified / in-progress / planned with evidence links; Growth signs it as the sole source for external claims.
- **Verification evidence:** —

### ATL-007 — Toolchain bootstrap (M0 completion)
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Priority:** P0
- **Status:** in-progress (delegated to atlas-cto 2026-07-21; see HANDOFFS.md) · **Dependencies:** none
- **Files affected:** package.json, pnpm-workspace.yaml, packages/config/**, apps/*/package.json, services/analytics/pyproject.toml, .github/workflows/ci.yml
- **Acceptance criteria:** pnpm workspaces resolve; lint/typecheck/test run green (empty suites allowed) locally and in CI; M0 exit gate (<10-min contributor setup) demonstrated.
- **Verification evidence:** —

### ATL-008 — Repo hygiene: remove committed archives/binaries
- **Owner:** atlas-cto · **Reviewer:** atlas-ceo · **Priority:** P2
- **Status:** blocked — awaiting human review of ATL-009 report (DL-007: deletion only after the human owner reviews docs/CLEANUP_REPORT.md and explicitly approves; destructive per ADR-0008)
- **Dependencies:** ATL-009 delivered + human owner approval of its recommendations
- **Files affected:** root *.zip, *.exe, .gitignore
- **Acceptance criteria:** archives removed in one commit after confirmation; .gitignore blocks recurrence (already in place).
- **Verification evidence:** —

### ATL-009 — Legacy asset cleanup report (report only, NO deletion/modification)
- **Owner:** atlas-cto · **Reviewer:** atlas-ceo · **Priority:** P1
- **Status:** in-progress (delegated to atlas-cto 2026-07-21; see HANDOFFS.md) · **Dependencies:** none
- **Files affected:** docs/CLEANUP_REPORT.md (new; read-only inspection of root archives/executables)
- **Deliverable:** docs/CLEANUP_REPORT.md inventorying every root archive/exe — size, date, read-only content listing, duplicate detection via hashes, and a recommendation per file.
- **Acceptance criteria:** every candidate file listed with evidence (size, date, content listing, hash); zero files deleted or modified; recommendations left as proposals for the human owner — no action taken.
- **Verification evidence:** —

### ATL-010 — M0 baseline + ATL-007 independent verification
- **Owner:** atlas-qa · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** ready (starts when atlas-cto delivers ATL-007) · **Dependencies:** ATL-007 delivered (ATL-009 report for inventory re-verification)
- **Files affected:** docs/pilot/QA_PLAN.md (results section), docs/coordination/AGENT_WORKBOARD.md (evidence links)
- **Acceptance criteria:** QA independently re-runs the toolchain commands (install/lint/typecheck/test) with recorded output; independently re-verifies the ATL-009 cleanup report's inventory (hashes, listings) without modifying any legacy file; issues a QA VERDICT with evidence linked here.
- **Verification evidence:** —
