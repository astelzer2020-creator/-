# Golden fixtures — financial engine (ADR-0006)

Each `*.json` fixture pins engine outputs for one input. All expected values here are
**hand-derived from closed-form algebra** — the derivation is written step by step in the
fixture's `derivation` field, and the `verifier` field names who verified it and how.

## Rules

- **Prototype outputs are BANNED as fixture sources.** `docs/CODEBASE_AUDIT.md` (D-3, D-4,
  C-1..C-5) proved the four legacy engines mutually inconsistent, with a fake NPV and a fake
  mobile IRR among them. Capturing any prototype's output would enshrine one of four
  unvalidated models. Every fixture must be derivable without running any Atlas code.
- Customer-spreadsheet reconciliation fixtures join in **M2** (PILOT_SCOPE §6): "your Excel
  says X, Atlas says X". Until then, only closed-form synthetic cases. Real customer data
  never enters the repo (docs/TESTING_STRATEGY.md rule 4).
- Changing any expected value requires written justification in the same PR (ADR-0006).

## Fixture schema

```json
{
  "name": "...",
  "kind": "cashflows | scenario",
  "verifier": "hand-derived, closed-form, <who> <date>",
  "derivation": ["step 1 ...", "step 2 ..."],
  "input": { ... },
  "expected": { ... }
}
```

- `kind: "cashflows"` — input is `cashflows` (integer agorot per period) +
  `discount_rate_per_period` (decimal string); exercises npv/irr/payback directly.
- `kind: "scenario"` — input is a full `/v1/simulate` scenario; exercises
  `build_cashflow` phasing plus the metrics.
- Only the keys present in `expected` are asserted (a fixture pins what was hand-derived).

## Tolerances (docs/TESTING_STRATEGY.md)

| Expected key | Comparison |
|---|---|
| `*_agorot`, `cashflows_agorot` | exact integers (boundary rounding is half-even) |
| `irr` | relative 1e-4 (iterative solver) |
| `payback_periods`, `discounted_payback_periods`, `roi_on_cost` | relative 1e-9 (pure math) |
| `null` | asserted as exactly `None` |
