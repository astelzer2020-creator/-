# Atlas — File Locks (live)

Collision control for all environments. Before implementation starts, the task owner declares a lock
here. Other agents MUST NOT modify locked files. A lock is released (STATUS: released) only after the
implementation handoff is recorded in `HANDOFFS.md`. Stale locks (past expected completion with no
handoff) are escalated to atlas-ceo — never silently overridden.

Template (copy verbatim, newest entry on top):

```
TASK ID:
OWNER:
FILES OR DIRECTORIES:
START TIME:
EXPECTED COMPLETION:
STATUS: active | released | expired-escalated
```

## Standing locks (do not require an entry — always in force)

- `frontend/`, `backend/`, `mobile/`, `data/`, root `*.zip`, `*.exe` — READ-ONLY for everyone
  (ADR-0007, ADR-0008, DL-007). Only the Founder can lift this via the decision log.
- `docs/coordination/**` — primary writer atlas-ceo (workers append only their own HANDOFFS.md
  entries and FILE_LOCKS.md declarations; QA appends verdicts where a task authorizes it).
- `.claude/agents/**`, `CLAUDE.md`, `docs/adr/**` — change only via Founder-approved task.

## Active locks

*(none — no implementation task is currently in progress)*

## Released locks

*(log begins after first unified-protocol implementation task)*
