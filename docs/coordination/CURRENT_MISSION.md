# Atlas — Current Mission

**Read this first, then AGENT_WORKBOARD.md. Work only on tasks assigned to you there.**

## Mission

**MISSION-1: Prepare Atlas for its first pilot customer** — executing since 2026-07-21 (DL-007).
Working branch: `claude/production-project-init-bfa25e`. Do not push elsewhere.

## State in one paragraph

M0 (foundation) is delivered and QA-verified (score 8/10): monorepo toolchain green
(pnpm + vitest + ruff/pytest/mypy, ~12-second setup), five-agent operating system installed, pilot
pack complete (scope, technical readiness, onboarding, QA plan, first-value journey, offer/pipeline/
demo docs — all reviewed). The legacy prototype and 21 root archives are inventoried in
`docs/CLEANUP_REPORT.md`; **deletion is PROPOSED, not approved — nothing legacy gets touched**
(DL-007, ATL-008 blocked on Founder). Next milestone: **M1 — core platform walking skeleton**
(login → project → one simulation → number on staging), which starts with ATL-003 once the CEO
green-lights sequencing.

## Sprint-1 (2026-07-21 → +1 week, DL-012)

**Gate update (DL-014):** the Founder issued a direct implementation green-light on 2026-07-21,
superseding the DL-012 gate ("implementation on ATL-003-PLAN approval"). **M1 implementation of
ATL-003 is IN PROGRESS** as three bounded atlas-cto work packages (ENGINE / SHARED+API / WEB, locks in
FILE_LOCKS.md). Legacy freeze (DL-007) and all QA verification gates remain fully in force.

- **ATL-001** (atlas-ceo) — Sprint-1 sequencing and roadmap/workboard consistency. IN PROGRESS.
- **ATL-003** (atlas-cto) — M1 implementation, three work packages per DL-014. IN PROGRESS.
- **ATL-003-PLAN** (atlas-cto) — CLOSED: superseded by DL-014; plan content embedded in the work-package delegations.
- **ATL-013** (atlas-product) — week-0 customer data dry-run runbook. READY.
- **ATL-014** (atlas-product) — Excel reconciliation worksheet spec (<1% divergence gate). READY.
- **ATL-018** (atlas-qa) — M1 verification plan for ATL-003 criteria + DL-008 QA_PLAN annotations (scenarios 3, 6 deferred-to-post-pilot). READY.
- **ATL-019** (atlas-growth) — one-page pilot agreement draft for Founder review; material prep ONLY, no outreach, no external use pre-ATL-006. READY.
- **ATL-020** (atlas-cto) — read-only codebase verification audit → docs/CODEBASE_AUDIT.md. VERIFIED (QA PASS, 2026-07-21).
- **ATL-021** (atlas-cto) — Founder Control Center: dashboard generated from coordination files + CI freshness gate (DL-013). IMPLEMENTED; held pending QA-S1-1 re-verification (fix bc52714).

**Freeze:** all P2/P3 tasks (ATL-011, ATL-012, ATL-015, ATL-016, ATL-017) are BACKLOG for Sprint-1
(DL-012). Unassigned work remains frozen as always.

## Governance (summary — full rules in EXECUTION_PROTOCOL.md)

- One management system: the Claude Code five-agent system (atlas-ceo/cto/product/growth/qa).
- VS Code agents (Codex, Claude Code VS, Grok) are execution workers on bounded workboard tasks.
- Coordination is via these shared files and Git ONLY — no automatic cross-platform communication
  exists. Pull before reading; commit + push after handoff.
- Statuses: BACKLOG/READY/IN PROGRESS/BLOCKED/IMPLEMENTED/IN REVIEW/VERIFIED/CLOSED.
  Workers stop at IMPLEMENTED; only QA sets VERIFIED; only CEO sets CLOSED.
- **Unassigned development is FROZEN.** If a piece of work has no task ID and owner on the
  workboard, it does not happen. Propose it via a HANDOFFS.md entry to atlas-ceo instead.
- After any coordination-file change, run `pnpm dashboard` and commit the regenerated
  FOUNDER_DASHBOARD.* — CI enforces freshness (DL-013; applies once ATL-021 lands).

## Standing constraints

1. No deletion/modification of legacy files, root archives, or executables (Founder directive, DL-007).
2. No feature work without Product acceptance criteria (CLAUDE.md rule).
3. No self-verification, ever. Evidence (commands + output) or it didn't happen.
4. Blocked-on-Founder items: ATL-008 (archive deletion decision on docs/CLEANUP_REPORT.md),
   GITLEAKS_LICENSE / secrets-scan wiring (DL-009). M1 kickoff green-light RECEIVED (DL-014).
