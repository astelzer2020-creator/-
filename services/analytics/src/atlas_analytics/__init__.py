"""Atlas analytics service package.

- ``engine/`` — pure financial computation (cashflow, NPV, IRR, payback, sensitivity),
  golden-file tested per ADR-0006. No I/O.
- ``api/`` — FastAPI boundary (``atlas_analytics.api.main:app``): POST /v1/simulate,
  /healthz, /readyz. Internal-only; reached exclusively via apps/api.
"""

__version__ = "0.1.0"
