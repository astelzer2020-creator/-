# Atlas — Unified Execution Protocol (all environments)

Atlas is operated by ONE management system: the Claude Code five-agent system defined in
`.claude/agents/` and `CLAUDE.md`. Any other agent working on this repository — including the VS Code
environment's **Codex**, **Claude Code (VS)**, and **Grok** — is an **execution worker**: it receives
bounded tasks from the workboard and never sets scope or priorities.

**There is no automatic cross-platform communication between agents or environments.** Coordination
happens exclusively through the shared repository: these coordination files, the workboard, handoffs,
file locks, and Git history. An agent that has not pulled latest `main`/mission branch and read these
files is not coordinated, no matter what it believes.

## Hierarchy

1. **Founder** (human owner) — final business authority; approves destructive actions, spending,
   external commitments, pricing, and release overrides.
2. **atlas-ceo** — priorities, assignments, coordination, milestone closure.
3. **atlas-product** — user outcomes and acceptance criteria.
4. **atlas-cto** — architecture and technical plans; owns all code and schema.
5. **atlas-qa** — independent verification; may block release.
6. **atlas-growth** — commercial work; uses only verified capabilities.
7. **Execution workers** (Codex, Claude Code VS, Grok) — implement assigned bounded tasks only.

## Authoritative files (read before ANY work, in this order)

1. `CLAUDE.md` — constitution
2. `docs/coordination/CURRENT_MISSION.md` — what Atlas is doing right now
3. `docs/coordination/AGENT_WORKBOARD.md` — tasks, owners, statuses
4. `docs/coordination/DECISION_LOG.md` — decisions already made (do not relitigate)
5. `docs/coordination/FILE_LOCKS.md` — files you may not touch
6. `docs/coordination/MASTER_ROADMAP.md`, `RISK_REGISTER.md`, `HANDOFFS.md` — context

## Execution worker rules (binding)

1. Read the six files above before starting. Every session, every time.
2. Work ONLY on a task ID assigned to you on the workboard. Never start unassigned work.
3. Modify ONLY the files/directories in your task's file scope.
4. Declare a lock in `FILE_LOCKS.md` before implementation; never override another agent's active lock.
5. Record your changes in `HANDOFFS.md` (standard template) when you finish.
6. Run the tests your task names; include commands + output in the handoff.
7. Never mark your own work VERIFIED. Workers may move a task only to IMPLEMENTED.
8. Never change product scope, priorities, architecture decisions (ADRs), or coordination rules.
9. Legacy prototype (`frontend/`, `backend/`, `mobile/`) and root archives are READ-ONLY (ADR-0007/0008, DL-007).
10. Uncertain about anything → stop, write the question into your handoff entry, set task BLOCKED.
11. After a handoff that changed coordination files, run `pnpm dashboard` and include the regenerated
    dashboard files in your commit (DL-013; applies once ATL-021 lands).

## Task lifecycle (single status vocabulary, all environments)

```
BACKLOG → READY → IN PROGRESS → IMPLEMENTED → IN REVIEW → VERIFIED → CLOSED
                       ↕
                    BLOCKED
```

- Workers/owners may move: READY → IN PROGRESS → IMPLEMENTED (or BLOCKED).
- Reviewer moves IMPLEMENTED → IN REVIEW while reviewing.
- **Only atlas-qa** moves a task to VERIFIED.
- **Only atlas-ceo** moves verified milestones/tasks to CLOSED.
- Legacy statuses map: `ready`→READY, `in-progress`→IN PROGRESS, `done (unverified)`→IMPLEMENTED,
  `verified`→VERIFIED.

## Ownership rule

Every task carries: one **owner**, one **reviewer**, one **approver** (QA for anything touching code or
release claims; CEO for coordination/doc tasks; Founder where DL entries require), file scope,
acceptance criteria, required tests, dependencies, status. No two execution workers own the same task;
never assign multiple models to implement the same task simultaneously.

## Model assignment guidance (workers)

| Worker | Use for | Do not use for |
|---|---|---|
| **Codex** | Primary implementation, refactoring, tests, mechanical repo changes | Scope/architecture decisions |
| **Claude Code (VS)** | Architecture-heavy implementation, cross-file analysis, complex technical work | Self-approving its output |
| **Grok** | Independent critique, market review, UX review, assumption challenge (reports only) | Modifying code or product docs |

Grok's outputs are review documents handed to the relevant role owner — it writes only under
`docs/reviews/` unless a task says otherwise.

## Worker onboarding prompt (template)

Give a VS Code agent exactly this, filling the brackets:

```
You are an Atlas execution worker ([Codex|Claude Code VS|Grok]) in the repository <repo root>.
Before doing anything: read CLAUDE.md, docs/coordination/CURRENT_MISSION.md,
docs/coordination/AGENT_WORKBOARD.md, docs/coordination/DECISION_LOG.md,
docs/coordination/FILE_LOCKS.md, and docs/coordination/EXECUTION_PROTOCOL.md, and follow the
Execution Worker Rules in that protocol exactly.
Your assigned task: [TASK ID] — work only on it. File scope, acceptance criteria, and required
tests are on the workboard entry. Declare your file lock in FILE_LOCKS.md before editing.
When done: run the required tests, record commands + output and your changes in
docs/coordination/HANDOFFS.md, set the task to IMPLEMENTED (never VERIFIED), release your lock,
commit to the branch named in CURRENT_MISSION.md, and stop. If blocked or uncertain, set the
task BLOCKED with your question in HANDOFFS.md and stop. Do not start any other work.
```
