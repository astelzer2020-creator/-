# Atlas — Testing Strategy

The product's core promise is a **number a developer takes to a bank**. Financial correctness therefore
gets the strictest treatment; everything else follows a standard pyramid. The pilot-gating test suite is
in [pilot/QA_PLAN.md](pilot/QA_PLAN.md); this document defines the ongoing engineering practice.

## The pyramid, per surface

| Layer | Scope | Tools | Runs |
|---|---|---|---|
| Unit | Pure logic: parsing, mapping, engine math, formatting | Vitest (TS), pytest (Py) | every push, < 2 min |
| Integration | API routes against real Postgres (Testcontainers), analytics HTTP contract | Vitest + Testcontainers, pytest + httpx | every push |
| E2E | The pilot workflow in a real browser: import → simulate → export | Playwright (pre-installed Chromium) | every PR to `main`, nightly full matrix |
| Golden files | Financial engine outputs vs. hand-verified spreadsheets | pytest fixtures in `services/analytics/tests/golden/` | every push, **blocking** |

## Financial correctness (the non-negotiable tier)

- Every engine function (IRR, NPV, payback, sensitivity) has golden fixtures: input JSON + expected output,
  hand-verified in a spreadsheet by a human, committed with a comment naming who verified and how.
- Tolerance policy: comparisons use relative tolerance `1e-9` for pure math, `1e-4` (0.01%) for iterative
  solvers (IRR). Monetary outputs compare exactly (integer agorot).
- Property tests (Hypothesis) guard invariants: NPV at rate=IRR ≈ 0; payback monotonic in price; sensitivity
  grid symmetric around base case.
- A change that alters any golden output requires updating the fixture **in the same PR with a written
  justification** — CI fails otherwise.

## Hebrew / encoding / RTL (the domain-specific tier)

- Import parser unit tests run every fixture in three encodings: UTF-8, UTF-8-BOM, Windows-1255.
- Fixture set includes: mixed Hebrew/English fields, geresh/gershayim in addresses (יח"ד, תב"ע),
  missing/reordered columns, duplicate מספר תיק.
- Playwright E2E asserts RTL layout (logical-property regressions) and that exported PDFs contain
  correctly-ordered Hebrew text (extract text, compare).

## Contract between API and analytics

- The analytics service publishes its OpenAPI schema as a build artifact; the API's client is generated
  from it. CI fails if the schema changed without regenerating the client — breaking changes are caught
  at build time, not in staging.

## Rules of practice

1. Tests accompany the change in the same PR; a bug fix starts with a failing test that reproduces it.
2. Coverage is tracked but not worshipped: hard floor 80% on `packages/shared` and `services/analytics/engine`
   (the trust-critical code); no floor on UI glue.
3. No test may depend on network, wall-clock time, or ordering; flaky tests get quarantined within a day
   and fixed or deleted within a week.
4. Test data: only synthetic or the committed sample fixtures (`data/sample/`). **Never** commit a real
   customer's taba file — pilot customer data stays out of the repo permanently.
5. E2E stays small (≤ ~10 scenarios): it covers the money path, not every screen.

## Definition of Done (testing view)

A feature is done when: unit tests cover its logic, integration tests cover its boundary, the E2E suite
still passes, golden files unchanged (or justified), and it works in RTL with Hebrew data.
