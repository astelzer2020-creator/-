# Atlas — Operating Protocol

How the five-agent system works. For agents in OTHER environments (VS Code: Codex, Claude Code VS,
Grok) the binding document is [`EXECUTION_PROTOCOL.md`](EXECUTION_PROTOCOL.md) (ADR-0010) — this file
governs the five Claude Code roles; workers take bounded tasks and follow the worker rules there. Agents: `atlas-ceo`, `atlas-cto`, `atlas-product`, `atlas-growth`,
`atlas-qa` (defined in `.claude/agents/`). Rationale: [ADR-0009](../adr/0009-multi-agent-operating-model.md).

## Standard execution flow (every feature/milestone)

1. **CEO** selects an approved objective from MASTER_ROADMAP.md.
2. **Product** defines the user outcome and testable acceptance criteria.
3. **CTO** produces an implementation plan (files, contracts, tests, risks).
4. **CEO** approves scope (logged in DECISION_LOG.md).
5. **CTO** implements, with tests, on the designated branch.
6. **QA** independently verifies against the acceptance criteria (runs everything itself).
7. **Product** verifies the user experience from the user's seat.
8. **Growth** updates commercial materials — only after steps 6–7 pass.
9. **CEO** closes the milestone and publishes executive status.

## Security-critical flow (auth, tenancy, upload handling, data deletion)

1. **CTO** implements.
2. **QA** performs an independent security review (authZ probes, injection/encoding checks, secrets scan).
3. Release stays **blocked** until QA verifies. No exceptions; overrides only by the human owner, in
   writing, in DECISION_LOG.md.

## Collision-prevention rules

1. **One owner per task.** A workboard task has exactly one owner and one reviewer (never the same agent).
2. **One primary writer per file group.** File-group ownership: `apps/`, `services/`, `packages/`,
   `infra/`, DB schema → CTO. `docs/pilot/PILOT_SCOPE.md`, product/UX docs, acceptance criteria → Product.
   `docs/pilot/PILOT_ONBOARDING.md`, GTM/sales materials → Growth. `docs/pilot/QA_PLAN.md`,
   TESTING_STRATEGY.md, SECURITY.md → QA. `docs/coordination/`, ROADMAP.md, adr/ index → CEO.
3. **No two agents modify the same critical files simultaneously.** Claim file groups on the workboard
   (Files affected) before starting.
4. **Inspect `git status` + `git diff` before editing** — always. Unexpected changes → stop, report to CEO.
5. **Report intended files** in the handoff before work begins.
6. **Large tasks are split** into bounded work packages (< ~1 day of work, < ~400-line diffs).
7. **Shared contracts are documented before parallel work** — API schema changes land in
   `packages/shared` / OpenAPI first, then consumers build against them.
8. **DB schema changes belong to CTO alone.**
9. **Release decisions belong to QA + CEO jointly** (QA issues go/no-go; CEO closes; neither alone ships).
10. **Marketing claims link to verified capabilities** — Growth's claims audit maps every statement to
    workboard verification evidence.

## Verification standard

- "Done" claims require evidence: commands + outputs, not assertions. QA re-runs them.
- No agent approves its own work. CEO never self-approves orchestration-level technical calls either —
  cross-checked by the relevant specialist.
- QA may not fix product code and approve it in the same cycle (see atlas-qa.md rule 2).
- After any coordination-file change, run `pnpm dashboard` and commit the regenerated
  FOUNDER_DASHBOARD.* — CI enforces freshness (DL-013; applies once ATL-021 lands).

## Conflict resolution

Two agents disagree → each states position + evidence in one round on the workboard task → CEO decides
and logs it → still contested or high-stakes → escalate to the human owner. Domain tiebreakers: user
truth = Product; technical feasibility = CTO; quality/security bar = QA; priority = CEO.

## Authoritative files

Order of precedence when documents conflict: `CLAUDE.md` (constitution) → ADRs → strategy docs
(`docs/*.md`) → pilot docs → coordination docs (live state). A conflict discovered between levels is
itself a workboard task: fix the lower-precedence doc.
