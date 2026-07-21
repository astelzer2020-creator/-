# ADR-0007: Freeze the legacy prototype in place until M2, then delete

**Status:** Accepted · 2026-07-21

## Context
The repository root contains a working prototype (`frontend/`, `backend/`, `mobile/`). It embodies real
domain knowledge — the taba column mapping, the Hebrew cp1255 handling, the engine formulas, working UI
flows — but is not production-grade (no types, no tests, no auth, in-memory storage, two public APIs).

## Decision
The prototype stays in the repo, **frozen and read-only**: no fixes land in it, nothing new imports from
it. It serves as the reference implementation while its logic is ported (with tests) into the new
structure during M1–M2. After the M2 exit gate it is deleted in a single commit.

## Consequences
- Porting can diff behavior against a running reference instead of archaeology through git history.
- Zero risk of losing embedded domain knowledge (the column mapping table alone is weeks of learning).
- Cost: temporary duplication and a confusing root for newcomers — mitigated by FOLDER_STRUCTURE.md
  labeling it clearly, and by the M2 deletion deadline.

## Alternatives rejected
- **Delete now and rely on git history:** history is where reference implementations go to be forgotten.
- **Refactor the prototype in place:** every prior structural decision (JS, Express, no workspace
  layout, dual APIs) would fight the target architecture; a clean skeleton with deliberate porting is
  faster and safer.
- **Move it to `legacy/`:** a rename churns every path for no functional gain; freezing achieves the same.
