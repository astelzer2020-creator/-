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
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close) | released | expired-escalated
```

## Standing locks (do not require an entry — always in force)

- `frontend/`, `backend/`, `mobile/`, `data/`, root `*.zip`, `*.exe` — READ-ONLY for everyone
  (ADR-0007, ADR-0008, DL-007). Only the Founder can lift this via the decision log.
- `docs/coordination/**` — primary writer atlas-ceo (workers append only their own HANDOFFS.md
  entries and FILE_LOCKS.md declarations; QA appends verdicts where a task authorizes it).
- `.claude/agents/**`, `CLAUDE.md`, `docs/adr/**` — change only via Founder-approved task.

## Active locks

```
TASK ID: ATL-023
OWNER: atlas-cto
FILES OR DIRECTORIES: apps/web/** (+ pnpm-lock.yaml side effect)
START TIME: 2026-07-23
EXPECTED COMPLETION: 2026-07-23 (same day)
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close)
NOTE: filed by orchestrator on the owner's behalf BEFORE spawning (R-07 action item).
```

```
TASK ID: ATL-022
OWNER: atlas-cto
FILES OR DIRECTORIES: apps/api/** (pg repos, migration runner), infra/environments/** (dev DB compose/env docs)
START TIME: 2026-07-22
EXPECTED COMPLETION: 2026-07-22 (same day)
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close)
NOTE: filed by orchestrator on the owner's behalf BEFORE spawning (R-07 action item).
```

```
TASK ID: ATL-013 + ATL-014
OWNER: atlas-product
FILES OR DIRECTORIES: docs/pilot/DRY_RUN_RUNBOOK.md (new), docs/pilot/RECONCILIATION_WORKSHEET.md (new)
START TIME: 2026-07-22
EXPECTED COMPLETION: 2026-07-22 (same day)
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close)
NOTE: filed by orchestrator on the owner's behalf BEFORE spawning (R-07 action item).
```

```
TASK ID: ATL-018
OWNER: atlas-qa
FILES OR DIRECTORIES: docs/pilot/QA_PLAN.md (M1 verification-plan section + DL-008 annotations)
START TIME: 2026-07-22
EXPECTED COMPLETION: 2026-07-22 (same day)
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close)
NOTE: filed by orchestrator on the owner's behalf BEFORE spawning (R-07 action item).
```

```
TASK ID: ATL-019
OWNER: atlas-growth
FILES OR DIRECTORIES: docs/growth/PILOT_AGREEMENT_DRAFT.md (new)
START TIME: 2026-07-22
EXPECTED COMPLETION: 2026-07-22 (same day)
STATUS: released (2026-07-23 — task delivered and QA-verified; released by orchestrator at cycle close)
NOTE: filed by orchestrator on the owner's behalf BEFORE spawning (R-07 action item).
```

## Released locks

```
TASK ID: ATL-003 (work package WEB)
OWNER: atlas-cto
FILES OR DIRECTORIES: apps/web/**
START TIME: 2026-07-21
EXPECTED COMPLETION: 2026-07-21 (same day)
STATUS: released (2026-07-21 — delivery handoff "ATL-003 work packages ENGINE + SHARED+API + WEB
+ integration pass" recorded in HANDOFFS.md; QA verdict PASS-WITH-KNOWN-ISSUES → VERIFIED, DL-015)
NOTE: filed by atlas-ceo to regularize in-flight DL-014 work. The ATL-021 CTO's "unclaimed
foreign edits" flag was procedurally correct — this lock was missing when work started.
```

```
TASK ID: ATL-003 (work package SHARED+API)
OWNER: atlas-cto
FILES OR DIRECTORIES: packages/shared/**, apps/api/**
START TIME: 2026-07-21
EXPECTED COMPLETION: 2026-07-21 (same day)
STATUS: released (2026-07-21 — delivery handoff "ATL-003 work packages ENGINE + SHARED+API + WEB
+ integration pass" recorded in HANDOFFS.md; QA verdict PASS-WITH-KNOWN-ISSUES → VERIFIED, DL-015)
NOTE: filed by atlas-ceo to regularize in-flight DL-014 work. The ATL-021 CTO's "unclaimed
foreign edits" flag was procedurally correct — this lock was missing when work started.
```

```
TASK ID: ATL-003 (work package ENGINE)
OWNER: atlas-cto
FILES OR DIRECTORIES: services/analytics/**
START TIME: 2026-07-21
EXPECTED COMPLETION: 2026-07-21 (same day)
STATUS: released (2026-07-21 — delivery handoff "ATL-003 work packages ENGINE + SHARED+API + WEB
+ integration pass" recorded in HANDOFFS.md; QA verdict PASS-WITH-KNOWN-ISSUES → VERIFIED, DL-015)
NOTE: filed by atlas-ceo to regularize in-flight DL-014 work. The ATL-021 CTO's "unclaimed
foreign edits" flag was procedurally correct — this lock was missing when work started.
```
