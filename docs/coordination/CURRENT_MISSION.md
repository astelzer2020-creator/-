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

## Governance (summary — full rules in EXECUTION_PROTOCOL.md)

- One management system: the Claude Code five-agent system (atlas-ceo/cto/product/growth/qa).
- VS Code agents (Codex, Claude Code VS, Grok) are execution workers on bounded workboard tasks.
- Coordination is via these shared files and Git ONLY — no automatic cross-platform communication
  exists. Pull before reading; commit + push after handoff.
- Statuses: BACKLOG/READY/IN PROGRESS/BLOCKED/IMPLEMENTED/IN REVIEW/VERIFIED/CLOSED.
  Workers stop at IMPLEMENTED; only QA sets VERIFIED; only CEO sets CLOSED.
- **Unassigned development is FROZEN.** If a piece of work has no task ID and owner on the
  workboard, it does not happen. Propose it via a HANDOFFS.md entry to atlas-ceo instead.

## Standing constraints

1. No deletion/modification of legacy files, root archives, or executables (Founder directive, DL-007).
2. No feature work without Product acceptance criteria (CLAUDE.md rule).
3. No self-verification, ever. Evidence (commands + output) or it didn't happen.
4. Blocked-on-Founder items: ATL-008 (archive deletion decision on docs/CLEANUP_REPORT.md),
   GITLEAKS_LICENSE / secrets-scan wiring (DL-009), M1 kickoff green-light.
