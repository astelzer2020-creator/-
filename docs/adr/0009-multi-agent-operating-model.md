# ADR-0009: Five-role multi-agent operating model (CEO / CTO / Product / Growth / QA)

**Status:** Accepted · 2026-07-21

## Context
Atlas is developed largely by AI agents coordinated through Claude Code. Unstructured agent work produces
the failure modes already visible in this repo's history: duplicated logic, conflicting edits, feature
sprawl, and "done" claims nobody verified. The pilot mission needs engineering, product, commercial, and
quality work advancing in parallel without collisions.

## Decision
Adopt a five-role operating model implemented as Claude Code custom subagents in `.claude/agents/`:
**CEO** (orchestration, priorities, decision log — never implements), **CTO** (all technical build),
**Product** (requirements, UX, acceptance criteria), **Growth** (positioning, pilot offer, materials),
**QA** (independent verification with release-blocking authority). Coordination state lives in
`docs/coordination/` (workboard, decision log, risk register, handoffs) under a written
OPERATING_PROTOCOL. Two hard rules anchor it: no one approves their own work, and nothing is
"production-ready" without independent QA verification.

## Consequences
- Every task has one owner, one reviewer, and written acceptance criteria before work starts.
- Verification is structurally separated from implementation (CTO builds, QA gates, CEO cannot self-approve).
- Overhead: handoffs and workboard upkeep; accepted as the price of parallel agents not corrupting
  each other's work.

## Alternatives rejected
- **One generalist agent doing everything sequentially:** no independent verification, no parallelism,
  and context overload on large missions.
- **Ad-hoc subagent spawning per task:** loses continuity of role knowledge and repeats the collisions
  this ADR exists to stop.
