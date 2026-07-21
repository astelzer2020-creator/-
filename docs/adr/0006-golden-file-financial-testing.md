# ADR-0006: Golden-file + property testing for the financial engine

**Status:** Accepted · 2026-07-21

## Context
Atlas's output is used to make investment decisions. A subtly wrong IRR is worse than a crash: it is
invisible and expensive. The prototype's engine has no tests at all. Unit tests alone verify that code
does what the author intended — not that the author's finance is right.

## Decision
Every engine function is pinned by **golden files**: input + expected output hand-verified in a
spreadsheet by a human, with the verifier named in the fixture. Tolerances: exact for integer agorot,
1e-9 relative for pure math, 1e-4 for iterative solvers. Property tests (Hypothesis) guard invariants
(NPV(IRR) ≈ 0, monotonicity). Changing a golden output requires updating the fixture in the same PR
with written justification; CI blocks otherwise.

## Consequences
- Refactors and dependency bumps of NumPy/SciPy are safe: the truth is external to the code.
- A reconciliation path exists for the pilot ("your Excel says X, Atlas says X") — this is a sales
  feature as much as a test strategy (see pilot/QA_PLAN.md).
- Creating fixtures is slow and manual by design; that is the point.

## Alternatives rejected
- **Ordinary unit tests with inline expected values:** the expected values would be computed by the same
  brain that wrote the bug.
- **Snapshot testing:** snapshots bless whatever the code currently does; golden files bless what a
  human verified.
