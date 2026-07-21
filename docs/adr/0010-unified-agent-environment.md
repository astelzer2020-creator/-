# ADR-0010: One operating system across environments; VS Code agents become execution workers

**Status:** Accepted · 2026-07-21 (Founder directive)

## Context
Atlas work happens in two environments: the Claude Code five-agent system (CEO/CTO/Product/Growth/QA,
ADR-0009) and a VS Code environment with independent agents (Codex, Claude Code VS, Grok). Two
uncoordinated management systems produced the failure modes visible in the repo's history — duplicate
snapshots committed as archives, parallel feature pushes with no shared scope, and no verification
chain. No live conflicting branches exist today (inspection 2026-07-21: only `main` and the mission
branch), which makes unification cheap now and expensive later.

## Decision
The Claude Code five-agent system is the single authoritative Atlas operating system. VS Code agents
are demoted to **execution workers**: bounded workboard tasks only, file locks before editing, handoffs
with test evidence after, task status ceiling of IMPLEMENTED. QA alone sets VERIFIED; CEO alone sets
CLOSED; the Founder holds final business authority. The coordination layer is the set of authoritative
files in `docs/coordination/` (now including CURRENT_MISSION.md, FILE_LOCKS.md, EXECUTION_PROTOCOL.md).
**Cross-environment coordination happens exclusively through the shared repository and Git** — no
automatic agent-to-agent communication across environments exists or is claimed. Model routing: Codex →
primary implementation/refactoring/tests; Claude Code VS → architecture-heavy, cross-file work; Grok →
independent critique/market/UX review (reports only, `docs/reviews/`). Never two workers on one task.

## Consequences
- One workboard, one status vocabulary (BACKLOG…CLOSED), one verification chain for every line of work
  regardless of which tool produced it.
- Workers must pull latest before reading the coordination files; a worker on a stale checkout is
  uncoordinated by definition — the protocol makes this explicit.
- Unassigned development is frozen; spontaneous work in any editor is a protocol violation, surfaced
  via handoff review rather than discovered in conflicts.

## Alternatives rejected
- **Two peer systems with a sync ritual:** double bookkeeping, and "who decides" stays ambiguous —
  exactly the problem observed.
- **Retiring the VS Code agents:** wastes capable executors; the bottleneck was governance, not
  capacity.
- **A live message bus between environments:** does not exist in either tool today; pretending
  otherwise would recreate silent divergence with extra steps.
