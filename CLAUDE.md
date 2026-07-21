# CLAUDE.md — The Atlas Constitution

**Atlas** is the Israeli urban-renewal simulation platform (סימולטור התחדשות עירונית): developers
(יזמים) import real plan data (תב"ע/PIO), run financial feasibility simulations (IRR, NPV, payback,
sensitivity), and export bank-ready Hebrew reports. **Mission:** replace the error-prone Excel
feasibility workflow with a tool whose numbers are trusted enough to take to a bank.

This file is the top of the precedence order: CLAUDE.md → `docs/adr/` → strategy docs (`docs/*.md`) →
pilot docs (`docs/pilot/`) → live coordination docs (`docs/coordination/`). Fix lower-level docs when
they conflict with higher ones.

## Repository layout (essentials)

- `apps/` (web, api, mobile) + `services/analytics` + `packages/` (shared, config) + `infra/` — the
  production platform. Full map: `docs/FOLDER_STRUCTURE.md`.
- `frontend/`, `backend/`, `mobile/` at root — **frozen legacy prototype** (ADR-0007). Read-only
  reference. Never fix it, never import from it; port out of it with tests.
- `docs/` — architecture, roadmap, standards, strategies, ADRs, pilot pack, coordination state.

## The multi-agent operating model

Work is done by five custom subagents in `.claude/agents/` (ADR-0009). Domain ownership:

| Agent | Owns | Never does |
|---|---|---|
| `atlas-ceo` | Priorities, workboard, decision log, risk register, executive status | Implementation; self-approval; marking work done without QA evidence |
| `atlas-cto` | ALL code: apps, services, packages, infra, DB schema, CI/CD, auth, performance | Pricing/positioning; approving its own release; features without approved requirements |
| `atlas-product` | Requirements, personas, journeys, UX, product copy, **acceptance criteria**, activation metrics | Writing code; approving security; inventing customer claims |
| `atlas-growth` | Positioning, ICP, pricing hypotheses, pilot offer, demo/sales materials, pipeline | Modifying code; claiming unverified capabilities; defining technical readiness |
| `atlas-qa` | Independent verification, E2E/regression, security review, release blockers, go/no-go | Fixing-and-approving in one cycle; accepting claims without running them |

**Delegation:** CEO decomposes objectives into workboard tasks (one owner + one reviewer each) and
routes by domain. **Handoffs:** every cross-role transfer uses the template in
`docs/coordination/HANDOFFS.md`, claiming file groups before work starts. **Verification:** nothing is
done/production-ready without atlas-qa independently executing the acceptance criteria and linking
evidence on the workboard; QA + CEO jointly own release decisions. **Conflicts:** one evidence round →
CEO decides and logs → human owner if still contested. The full flow (9-step standard, 3-step
security-critical) and the ten collision-prevention rules live in
`docs/coordination/OPERATING_PROTOCOL.md` — they are binding.

## Rules for ALL agents and sessions

1. **No self-approval, ever.** Implementer ≠ verifier on every task.
2. **Evidence or it didn't happen.** "Tests pass" means commands + output in the handoff.
3. **Check `git status`/`git diff` before editing;** respect file-group claims on the workboard.
4. **Coding rules:** `docs/CODING_STANDARDS.md` (strict TS, validate-at-boundary, integer agorot for
   money, i18n keys for all user-facing strings, CSS logical properties for RTL).
5. **Testing rules:** `docs/TESTING_STRATEGY.md`. Golden-file changes need written justification in the
   same PR. Real customer data never enters the repo — fixtures are synthetic only.
6. **Security rules:** `docs/SECURITY.md`. No secrets in git; every endpoint declares its role; analytics
   service and DB are never internet-facing.
7. **Release rules:** QA has blocking authority (S1 = any wrong financial number, security P1, broken
   auth/main flow, cross-tenant access, failed build, missing rollback). Overrides: human owner only,
   in writing, in the decision log.
8. **Documentation rules:** `docs/DOCUMENTATION.md`. Docs change in the same PR as the code that
   invalidates them; changed decisions get a new superseding ADR — history is never rewritten.
9. **Destructive actions** (deleting files/data, force-push, external commitments, spending) require
   human owner approval first.
10. **No binaries/archives in git** (ADR-0008).

## Current state (2026-07-21)

M0 in progress: structure + strategies + agent system installed; toolchain bootstrap (ATL-007) is the
next engineering task. MISSION-1 (first pilot customer) is decomposed on
`docs/coordination/AGENT_WORKBOARD.md` — **prepared, awaiting human kickoff (DL-002)**.
