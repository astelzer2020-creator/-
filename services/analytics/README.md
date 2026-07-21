# services/analytics

Python + FastAPI financial engine: IRR, NPV, payback, sensitivity. **Internal-only — never
internet-facing** (docs/SECURITY.md); apps/api is the sole caller and owns auth/roles.

## Layout

- `src/atlas_analytics/engine/` — pure computation, no I/O, `mypy --strict` clean.
  Money is integer agorot at boundaries, `Decimal` inside; rates are Decimal fractions
  (`0.07` = 7%). v1 deliberately uses stdlib `decimal` instead of NumPy/SciPy — exactness
  and auditability over speed at pilot scale (documented deviation; see
  `engine/__init__.py`).
- `src/atlas_analytics/api/` — Pydantic v2 models + FastAPI app
  (`uvicorn atlas_analytics.api.main:app`). Agorot travel as JSON ints, rates as decimal
  strings. OpenAPI at `/openapi.json`.
- `tests/golden/` — hand-derived, closed-form golden fixtures (ADR-0006). Prototype
  outputs are banned as fixture sources (docs/CODEBASE_AUDIT.md D-3/C-4);
  customer-spreadsheet reconciliation fixtures join in M2.

## Commands

```
uv sync
uv run ruff check . && uv run ruff format --check .
uv run mypy src
uv run pytest
```

See docs/ARCHITECTURE.md, docs/TESTING_STRATEGY.md, docs/adr/0006.
