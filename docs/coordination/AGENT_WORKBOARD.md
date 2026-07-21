# Atlas — Agent Workboard (live)

One task = one owner + one reviewer (never the same agent) + one approver. Nothing moves to VERIFIED
without linked QA evidence. **Unified status vocabulary (ADR-0010, all environments):**
`BACKLOG | READY | IN PROGRESS | BLOCKED | IMPLEMENTED | IN REVIEW | VERIFIED | CLOSED`.
Legacy statuses on existing entries map: ready→READY, in-progress→IN PROGRESS,
done (unverified/reviewed)→IMPLEMENTED (reviewed = IN REVIEW passed), verified→VERIFIED.
Execution workers (Codex, Claude Code VS, Grok — see EXECUTION_PROTOCOL.md) may move tasks only to
IMPLEMENTED; only atlas-qa sets VERIFIED; only atlas-ceo sets CLOSED.
**Approver defaults** (unless a task states otherwise): atlas-qa for anything touching code, CI, or
release claims; atlas-ceo for documentation/coordination tasks; Founder wherever a decision-log entry
requires it (ATL-008, pricing, external commitments).

## MISSION-1: Prepare Atlas for its first pilot customer

**EXECUTING as of 2026-07-21** — human owner kickoff approved (DECISION_LOG DL-007). Constraint: no
deletion/modification of legacy files, archives, or executables; cleanup report first (ATL-009), then
human review before ATL-008 acts.

## Sprint-1 (2026-07-21 → +1 week)

Defined per Founder sprint-planning directive of 2026-07-21 (DL-012). **Scope rule: P0/P1 only.**
~~Sprint-1 is planning + documentation + verification-prep — NO feature implementation this mission;
ATL-003 advances only as a plan, gated on Founder approval of docs/plans/ATL-003-PLAN.md~~ —
**superseded by DL-014** (see amendment below). All P2/P3 tasks remain frozen to BACKLOG for the
sprint (ATL-011, ATL-012, ATL-015, ATL-016, ATL-017). Role assignments per Founder: CEO —
roadmap/coordination; CTO — highest technical blocker + codebase audit; Product —
onboarding/first-value; QA — verification plan; Growth — pilot material only (no outreach).

**Scope amendment (2026-07-21, DL-013):** ATL-021 (Founder Control Center) added by Founder directive
— Sprint-1 grows to **8 tasks**. ATL-021 is P0, so the P0/P1-only rule holds.

**Scope amendment (2026-07-21, DL-014):** Founder direct green-light superseded the DL-012 plan gate —
**ATL-003 implementation joined the sprint** (P0) as three bounded atlas-cto work packages (ENGINE /
SHARED+API / WEB; locks in FILE_LOCKS.md). ATL-003-PLAN is CLOSED as superseded. Legacy freeze
(DL-007) and all QA verification gates remain fully in force.

| Task | Owner | Reviewer | Approver | Pri | Effort | Status | Goal (one line) |
|---|---|---|---|---|---|---|---|
| ATL-001 | atlas-ceo | human owner | Founder | P0 | 0.5d | IN PROGRESS | Sprint-1 sequencing + roadmap consistency; IMPLEMENTED when this sprint section is complete, Founder sign-off pending |
| ATL-003-PLAN | atlas-cto | atlas-ceo | atlas-qa | P0 | 1d | CLOSED | Superseded by DL-014 Founder direct green-light; plan content embedded in the three ATL-003 work-package delegations |
| ATL-003 | atlas-cto | atlas-qa | atlas-qa | P0 | — | IN PROGRESS | M1 implementation joined the sprint per DL-014: three work packages — ENGINE, SHARED+API, WEB |
| ATL-013 | atlas-product | atlas-cto | atlas-ceo | P1 | 0.5d | READY | Week-0 customer data dry-run runbook |
| ATL-014 | atlas-product | atlas-qa | atlas-ceo | P1 | 0.5d | READY | Excel reconciliation worksheet spec (<1% divergence gate) |
| ATL-018 | atlas-qa | atlas-ceo | atlas-ceo | P1 | 0.5d | READY | M1 verification plan for ATL-003 criteria + DL-008 QA_PLAN annotations |
| ATL-019 | atlas-growth | atlas-product | Founder | P1 | 0.5d | READY | One-page pilot agreement draft text — material prep only, no external use |
| ATL-020 | atlas-cto | atlas-qa | atlas-qa | P0 | 0.5d | VERIFIED | Read-only codebase audit → docs/CODEBASE_AUDIT.md; QA PASS 2026-07-21 (6/6 spot-checks) |
| ATL-021 | atlas-cto | atlas-qa | atlas-ceo | P0 | 0.5d | IMPLEMENTED | Founder Control Center (DL-013); held by QA-S1-1 (fix bc52714, re-verification in progress) |

**Sprint-1 exit criteria (amended per DL-014):** all Sprint-1 tasks (incl. the three ATL-003 work
packages) at IMPLEMENTED or VERIFIED with evidence, plus Founder rulings received on ATL-008 (archive
deletion, DL-010) and GITLEAKS_LICENSE/secrets-scan (DL-009). The former ATL-003-PLAN approval gate is
satisfied by the DL-014 direct green-light.

Blocked-on-Founder: ATL-008 (DL-010), GITLEAKS/secrets-scan (DL-009). ATL-005/ATL-006 remain BLOCKED
on ATL-003 delivery. ATL-002/004/007/009/010 keep their completed statuses.

---

### ATL-001 — Finalize pilot milestone priorities and sequencing
- **Owner:** atlas-ceo · **Reviewer:** human owner · **Priority:** P0 · **Effort:** 0.5d
- **Status:** IN PROGRESS (2026-07-21) — being satisfied by the Sprint-1 plan above (DL-012); moves to IMPLEMENTED when the sprint section is complete, Founder sign-off pending · **Dependencies:** none
- **Files affected:** docs/coordination/MASTER_ROADMAP.md, docs/ROADMAP.md
- **Acceptance criteria:** M1/M2/M3 decomposed into workboard tasks each with owner, reviewer, criteria; sequencing respects dependencies; human owner sign-off recorded in DECISION_LOG.
- **Verification evidence:** —

### ATL-002 — Verify onboarding and first-value journey
- **Owner:** atlas-product · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** done (reviewed by atlas-ceo 2026-07-21) · **Dependencies:** ATL-001
- **Files affected:** docs/pilot/PILOT_SCOPE.md, docs/pilot/journey/*
- **Deliverable:** docs/pilot/FIRST_VALUE_JOURNEY.md + M2 acceptance criteria.
- **Acceptance criteria:** week-by-week first-value journey validated against PILOT_ONBOARDING.md; every step of "raw data → trusted Hebrew PDF in <30 min" has an owner (product feature or human process); gaps filed as workboard tasks; activation metrics instrumented-or-ticketed.
- **Verification evidence:** docs/pilot/FIRST_VALUE_JOURNEY.md (9-step journey, every step owned) + docs/pilot/PILOT_SCOPE.md §9 (20 given/when/then criteria: AC-IMP/SCN/RES/EXP/E2E) + 5 labeled assumptions A1–A5. CEO review 2026-07-21: meets acceptance criteria — every step owned, criteria testable by atlas-qa, activation metrics dispositioned. Documentation task; reviewer = atlas-ceo per delegation. Product's 4 flagged scope inconsistencies resolved by DL-008; 5 proposed gap tasks filed as ATL-011…ATL-015 below.

### ATL-003 — Resolve P0/P1 production issues (persistence, auth, single API, CI)
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Priority:** P0
- **Status:** IN PROGRESS (2026-07-21, DL-014 Founder direct green-light) — executing as three bounded atlas-cto work packages: ENGINE (services/analytics/**), SHARED+API (packages/shared/** + apps/api/**), WEB (apps/web/**); locks filed in FILE_LOCKS.md · **Dependencies:** ATL-001, ATL-007 (satisfied)
- **Files affected:** apps/api/**, services/analytics/**, packages/shared/**, infra/**, .github/workflows/**
- **Acceptance criteria:** the four P0-fatal gaps from docs/pilot/TECHNICAL_READINESS.md closed — Postgres persistence with migrations; auth with roles; analytics internal-only behind the single public API; CI green gate. Each closed gap has QA verification evidence.
- **Verification evidence:** —
- **Sprint-1 note:** the DL-012 gate (implementation only after Founder approval of ATL-003-PLAN.md) was SUPERSEDED by DL-014 — Founder pre-approved implementation directly. QA gates unchanged.

### ATL-003-PLAN — ATL-003 implementation plan (sub-task of ATL-003; plan only, NO code)
- **Owner:** atlas-cto · **Reviewer:** atlas-ceo · **Approver:** atlas-qa · **Priority:** P0 · **Effort:** 1d
- **Status:** CLOSED (2026-07-21, atlas-ceo) — superseded by DL-014 Founder direct green-light; plan content embedded in the three ATL-003 work-package delegations (ENGINE / SHARED+API / WEB). Sequencing deviation (plan-then-approve skipped by Founder instruction) recorded in DL-014 · **Dependencies:** none (ATL-003 prerequisites already satisfied)
- **Files affected:** docs/plans/ATL-003-PLAN.md (new; no source code touched)
- **Acceptance criteria:** plan covers (1) files/modules to be created or changed; (2) DB schema draft (Postgres, migrations); (3) API contract changes; (4) test plan incl. golden fixtures per ADR-0006; (5) work-package breakdown into bounded execution-worker tasks with file groups. ATL-003 implementation itself starts only after Founder approval of this plan (DL-012).
- **Verification evidence:** —

### ATL-004 — Create pilot offer and demo materials
- **Owner:** atlas-growth · **Reviewer:** atlas-product · **Priority:** P1
- **Status:** done (reviewed by atlas-product 2026-07-21) — bounded scope delivered; claims audit deferred to ATL-006 as scoped · **Dependencies:** ATL-002 (journey), ATL-006 (verified capability list for claims audit — blocks the claims-bearing portion only)
- **Files affected:** docs/pilot/PILOT_ONBOARDING.md, docs/growth/*
- **Acceptance criteria:** pilot offer one-pager (8-week design-partner terms) ready for human owner review; demo script exercises only QA-verified flows; claims audit attached mapping every capability statement to evidence.
- **Verification evidence:** docs/growth/PILOT_OFFER.md, docs/growth/PIPELINE.md, docs/growth/DEMO_OUTLINE.md. Reviewer atlas-product verdict: ACCEPT-WITH-CHANGES (C1–C4); all four fixes applied by atlas-growth in commit 68b466f; reviewer confirmed no re-review needed. Claims-bearing portion remains gated on ATL-006 capability matrix per the bounded-scope delegation.

### ATL-005 — Independent critical-journey and security verification
- **Owner:** atlas-qa · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** BLOCKED (on ATL-003 delivery — now IN PROGRESS per DL-014; unblocks when the three work packages reach IMPLEMENTED with handoffs) · **Dependencies:** ATL-003
- **Files affected:** docs/pilot/QA_PLAN.md (results), docs/coordination/AGENT_WORKBOARD.md (evidence links)
- **Acceptance criteria:** the 11 acceptance scenarios of QA_PLAN.md executed with recorded results; authZ probe of all endpoints incl. cross-tenant attempts; golden-file suite green; verdict + production-readiness score published.
- **Verification evidence:** —

### ATL-006 — Verified capability matrix
- **Owner:** atlas-qa · **Reviewer:** atlas-growth · **Priority:** P1
- **Status:** BLOCKED (on ATL-005 → ATL-003 chain) · **Dependencies:** ATL-005
- **Files affected:** docs/coordination/capability-matrix.md (new)
- **Acceptance criteria:** every prototype-claimed feature classified verified / in-progress / planned with evidence links; Growth signs it as the sole source for external claims.
- **Verification evidence:** —

### ATL-007 — Toolchain bootstrap (M0 completion)
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Priority:** P0
- **Status:** done — QA PASS-WITH-KNOWN-ISSUES (ATL-010, 2026-07-21); `verified` pending first remote CI run observed green (QA-M0-3) · **Dependencies:** none
- **Files affected:** package.json, pnpm-workspace.yaml, packages/config/**, apps/*/package.json, services/analytics/pyproject.toml, .github/workflows/ci.yml
- **Acceptance criteria:** pnpm workspaces resolve; lint/typecheck/test run green (empty suites allowed) locally and in CI; M0 exit gate (<10-min contributor setup) demonstrated.
- **Verification evidence:** docs/pilot/QA_PLAN.md § "M0 Verification Results (ATL-010, 2026-07-21)" — QA independently re-ran pnpm install/lint/typecheck/test/format (green, 226 lockfile resolutions) and uv sync/ruff/pytest/mypy (green); 48s wall time vs 10-min M0 gate; package.json changes additive-only confirmed. QA verdict: PASS-WITH-KNOWN-ISSUES; M0 production-readiness 8/10.
- **Open QA defects (from ATL-010):**
  - QA-M0-1 (S3) — missing delivery handoff for ATL-007+ATL-009. **RESOLVED 2026-07-21:** CEO filed the delivery handoffs in HANDOFFS.md on the CTO's behalf (CTO cannot write coordination files).
  - QA-M0-2 (S3) — secrets-scan CI job is decorative (exit-0). Needs GITLEAKS_LICENSE decision from human owner — escalated (DL-009).
  - QA-M0-3 (S4) — remote CI unproven; first run occurs on next push (orchestrator pushing after this consolidation). Gates promotion of ATL-007 to `verified`.
  - QA-M0-4 (S4) — no `prettier --check` in CI. Fix owner: atlas-cto (fold into ATL-003 CI work).
  - QA-M0-5 (S4) — informational; no action gate.

### ATL-008 — Repo hygiene: remove committed archives/binaries
- **Owner:** atlas-cto · **Reviewer:** atlas-ceo · **Priority:** P2
- **Status:** blocked — ATL-009 delivered and QA-verified; deletion decision formally handed to the human owner with the report's proposal (delete all 21 archives; 4 unique payloads; all legacy snapshots already in git history) — see DL-010. Awaiting explicit human owner approval (destructive per ADR-0008/CLAUDE.md rule 9)
- **Dependencies:** ATL-009 (satisfied — verified) + human owner approval of its recommendations
- **Files affected:** root *.zip, *.exe, .gitignore
- **Acceptance criteria:** archives removed in one commit after confirmation; .gitignore blocks recurrence (already in place).
- **Verification evidence:** —

### ATL-009 — Legacy asset cleanup report (report only, NO deletion/modification)
- **Owner:** atlas-cto · **Reviewer:** atlas-ceo · **Priority:** P1
- **Status:** verified (QA, ATL-010, 2026-07-21) · **Dependencies:** none
- **Files affected:** docs/CLEANUP_REPORT.md (new; read-only inspection of root archives/executables)
- **Deliverable:** docs/CLEANUP_REPORT.md inventorying every root archive/exe — size, date, read-only content listing, duplicate detection via hashes, and a recommendation per file.
- **Acceptance criteria:** every candidate file listed with evidence (size, date, content listing, hash); zero files deleted or modified; recommendations left as proposals for the human owner — no action taken.
- **Verification evidence:** docs/pilot/QA_PLAN.md § "M0 Verification Results (ATL-010, 2026-07-21)" — QA independently re-computed and re-verified all 21 archive hashes (21 archives → 4 unique sha256 payloads) and proved zero legacy modification. QA verdict: PASS. Deletion decision now with the human owner (DL-010; executes as ATL-008).

### ATL-010 — M0 baseline + ATL-007 independent verification
- **Owner:** atlas-qa · **Reviewer:** atlas-ceo · **Priority:** P0
- **Status:** done (reviewed by atlas-ceo 2026-07-21) · **Dependencies:** ATL-007 delivered (ATL-009 report for inventory re-verification)
- **Files affected:** docs/pilot/QA_PLAN.md (results section), docs/coordination/AGENT_WORKBOARD.md (evidence links)
- **Acceptance criteria:** QA independently re-runs the toolchain commands (install/lint/typecheck/test) with recorded output; independently re-verifies the ATL-009 cleanup report's inventory (hashes, listings) without modifying any legacy file; issues a QA VERDICT with evidence linked here.
- **Verification evidence:** docs/pilot/QA_PLAN.md § "M0 Verification Results (ATL-010, 2026-07-21)". Verdicts: ATL-007 PASS-WITH-KNOWN-ISSUES (defects QA-M0-1…QA-M0-5, logged under ATL-007); ATL-009 PASS (all 21 hashes re-verified, zero legacy modification proven); M0 production-readiness 8/10. CEO review: acceptance criteria met; verification task closed.

---

## Gap tasks from ATL-002 (Product proposals, accepted by CEO 2026-07-21)

### ATL-011 — Activation-metric instrumentation spec
- **Owner:** atlas-cto · **Reviewer:** atlas-product · **Priority:** P2
- **Status:** BACKLOG — frozen per Sprint-1 rule (DL-012) · **Dependencies:** ATL-003
- **Files affected:** apps/api/**, packages/shared/** (spec first; implementation scoped in the spec)
- **Acceptance criteria:** each activation metric dispositioned in FIRST_VALUE_JOURNEY.md has an instrumentation spec (event, trigger point, storage, privacy note); Product signs off that the spec covers the journey's activation metrics; implementable within M1/M2 scope.
- **Verification evidence:** —

### ATL-012 — Pilot account provisioning flow
- **Owner:** atlas-cto · **Reviewer:** atlas-product · **Priority:** P2
- **Status:** BACKLOG — frozen per Sprint-1 rule (DL-012) · **Dependencies:** ATL-003
- **Files affected:** apps/api/**, infra/**
- **Acceptance criteria:** documented, repeatable flow to provision the pilot customer's org + users (roles per SECURITY.md) on pilot-prod; no manual DB edits; dry-run executed and recorded; Product confirms it matches the week-0 onboarding steps.
- **Verification evidence:** —

### ATL-013 — Week-0 data dry-run runbook
- **Owner:** atlas-product · **Reviewer:** atlas-cto · **Approver:** atlas-ceo · **Priority:** P1 · **Effort:** 0.5d
- **Status:** READY — Sprint-1 scope (DL-012) · **Dependencies:** none
- **Files affected:** docs/pilot/** (runbook, new)
- **Acceptance criteria:** step-by-step runbook for the week-0 customer data dry-run (inputs requested, formats accepted, failure triage, go/adjust decision rule per PILOT_ONBOARDING.md); CTO confirms technical steps are executable; directly mitigates R-04.
- **Verification evidence:** —

### ATL-014 — Excel reconciliation worksheet
- **Owner:** atlas-product · **Reviewer:** atlas-qa · **Approver:** atlas-ceo · **Priority:** P1 · **Effort:** 0.5d
- **Status:** READY — Sprint-1 scope (DL-012) · **Dependencies:** none
- **Files affected:** docs/pilot/** (worksheet spec, new)
- **Acceptance criteria:** reconciliation worksheet mapping Atlas outputs to the customer's Excel line items with the <1% divergence target (PILOT_SCOPE.md); QA confirms it is executable as the M2 reconciliation gate; synthetic fixtures only (no customer data in repo).
- **Verification evidence:** —

### ATL-015 — Hebrew UI copy pack
- **Owner:** atlas-product · **Reviewer:** atlas-growth · **Priority:** P2
- **Status:** BACKLOG — frozen per Sprint-1 rule (DL-012) · **Dependencies:** none
- **Files affected:** docs/pilot/** or packages/shared i18n key inventory (copy pack doc; code changes belong to atlas-cto)
- **Acceptance criteria:** Hebrew copy for the pilot journey's user-facing strings delivered as i18n key → text pairs (CODING_STANDARDS.md: i18n keys, RTL-safe); Growth reviews tone against positioning; no unverified capability claims in-product.
- **Verification evidence:** —

---

## Sprint-1 new tasks (DL-012 / DL-013)

### ATL-018 — M1 verification plan (QA readiness for ATL-003) + DL-008 QA_PLAN annotations
- **Owner:** atlas-qa · **Reviewer:** atlas-ceo · **Approver:** atlas-ceo · **Priority:** P1 · **Effort:** 0.5d
- **Status:** READY — Sprint-1 scope (DL-012) · **Dependencies:** none (informed by ATL-003-PLAN when available, not blocked on it)
- **Files affected:** docs/pilot/QA_PLAN.md
- **Acceptance criteria:** (1) a written verification plan stating how QA will independently verify each ATL-003 acceptance criterion — Postgres persistence with migrations, auth with roles incl. cross-tenant probes, analytics internal-only behind the single public API, CI green gate; (2) DL-008's pending action executed — QA_PLAN.md scenarios 3 and 6 annotated as deferred-to-post-pilot; (3) no verification claims about unbuilt features.
- **Verification evidence:** —

### ATL-019 — Pilot agreement draft text (material preparation ONLY)
- **Owner:** atlas-growth · **Reviewer:** atlas-product · **Approver:** Founder · **Priority:** P1 · **Effort:** 0.5d
- **Status:** READY — Sprint-1 scope (DL-012) · **Dependencies:** none (source: docs/growth/PILOT_OFFER.md terms per DL-005)
- **Files affected:** docs/growth/PILOT_AGREEMENT_DRAFT.md (new)
- **Acceptance criteria:** one-page pilot agreement draft text derived from PILOT_OFFER.md terms (free 8-week design-partner, hard end date, feedback commitment, case-study rights, week-7 conversion conversation), delivered for Founder review. **NO outreach, NO external use pre-ATL-006** — capability claims stay gated on the verified capability matrix.
- **Verification evidence:** —

### ATL-020 — Codebase verification audit (READ-ONLY)
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Approver:** atlas-qa · **Priority:** P0 · **Effort:** 0.5d
- **Status:** VERIFIED (atlas-qa, 2026-07-21 — verdict PASS, QA recommends promotion) · **Dependencies:** none
- **Files affected:** docs/CODEBASE_AUDIT.md (new; NO code modified — read-only inspection)
- **Acceptance criteria:** audit report covering duplicate work, dead code, conflicting implementations, unfinished features, and temporary fixes across the repo; every finding cites file paths and evidence; zero source files modified; recommendations filed as proposals (any resulting work needs new workboard tasks).
- **Verification evidence:** docs/pilot/QA_PLAN.md § "Sprint-1 Verification Results (ATL-020/ATL-021, 2026-07-21)" — adversarial spot-check of audit claims against source: 6/6 MATCH incl. all CRITICAL claims; verdict PASS. Minor nit QA-S1-3 (S4): C-1/T-6 cite ROIScreen.jsx:61, actual line 62 — no gate.

### ATL-021 — Founder Control Center — generated dashboard + freshness CI gate
- **Owner:** atlas-cto · **Reviewer:** atlas-qa · **Approver:** atlas-ceo · **Priority:** P0 (Founder directive, DL-013) · **Effort:** 0.5d
- **Status:** IMPLEMENTED (2026-07-21) — held at IMPLEMENTED by QA pending QA-S1-1 re-verification; NOT verified yet · **Dependencies:** none
- **File scope:** tools/founder-dashboard/**, FOUNDER_DASHBOARD.md + FOUNDER_DASHBOARD.html (root, generated), package.json (additive script), .github/workflows/ci.yml (freshness step), README.md (one banner link line)
- **Acceptance criteria:** (1) all six sections (EXECUTIVE / TEAM / ENGINEERING / PRODUCT / BUSINESS / RISKS) generated from coordination/docs sources or explicitly "n/a — source not yet in repo"; (2) deterministic output — same commit → byte-identical, timestamp from git not wall clock; (3) CI fails if coordination files change without regeneration; (4) zero hand-entered status constants; (5) QA verifies by re-running the generator and cross-checking values against sources.
- **Verification evidence:** docs/pilot/QA_PLAN.md § "Sprint-1 Verification Results (ATL-020/ATL-021, 2026-07-21)" — partial: generator determinism checks recorded; freshness gate FAILED under real CI conditions (see QA-S1-1).
- **Open QA defects:**
  - QA-S1-1 (S3) — CI freshness gate false-positives on shallow clone (depth-1 grafted HEAD stamps wrong source commit → gate fails on every remote run, fresh or stale). CTO fix delivered in commit bc52714; **QA re-verification IN PROGRESS** — VERIFIED gate.
  - QA-S1-2 (S4) — commit e3f7e6d message overclaims "coordination updates" (commit touched no coordination file). Noted for history hygiene; no gate.

---

## Execution-worker tasks (unified environment, ADR-0010 / DL-011)

Workers follow EXECUTION_PROTOCOL.md: lock files in FILE_LOCKS.md before editing, handoff with test
evidence after, status ceiling IMPLEMENTED. Never two workers on one task.

### ATL-016 — Independent assumption challenge of the pilot pack
- **Owner:** Grok (execution worker) · **Reviewer:** atlas-product · **Approver:** atlas-ceo · **Priority:** P2
- **Status:** BACKLOG — frozen per Sprint-1 rule (DL-012) · **Dependencies:** none
- **File scope:** docs/reviews/ATL-016-pilot-pack-critique.md (new file ONLY; read-only everywhere else)
- **Acceptance criteria:** adversarial critique of docs/pilot/* — challenge assumptions A1–A5, the ICP choice (DL-004), the <30-min first-value claim, and the ≥5-projects success metric; each challenge states the evidence that would settle it; no edits to the challenged documents.
- **Required tests:** n/a (review document).
- **Verification evidence:** —

### ATL-017 — CI polish: prettier --check gate (QA-M0-4)
- **Owner:** Codex (execution worker) · **Reviewer:** atlas-cto · **Approver:** atlas-qa · **Priority:** P2
- **Status:** BACKLOG — frozen per Sprint-1 rule (DL-012) · **Dependencies:** none (the gitleaks part of QA-M0-2 is NOT in scope — blocked on DL-009 Founder decision)
- **File scope:** .github/workflows/ci.yml, root package.json scripts (additive) ONLY
- **Acceptance criteria:** CI lint job fails on unformatted files via `prettier --check` (or `pnpm format:check`); local run evidence included; prototype scripts untouched; secrets-scan job NOT modified.
- **Required tests:** run the new check locally clean, then demonstrate it fails on a deliberately misformatted scratch file (reverted), outputs in handoff.
- **Verification evidence:** —
