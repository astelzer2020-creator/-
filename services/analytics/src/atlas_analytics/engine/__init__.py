"""Atlas financial engine — pure computation, no I/O, no state.

Every function here takes plain values and returns plain values; nothing reads a file, a clock,
a network, or a database. That keeps the engine independently testable against the golden
fixtures in ``tests/golden/`` (ADR-0006).

Numeric policy (docs/CODING_STANDARDS.md #3, docs/TESTING_STRATEGY.md):

- Monetary amounts are **integer agorot** at every boundary (inputs and monetary outputs).
- Rates and fractions are ``Decimal`` decimal fractions (``Decimal("0.07")`` = 7%), never ``7``.
- Internal arithmetic is ``decimal.Decimal`` end to end; binary floats never touch money.
- Where a Decimal quantity must become integer agorot, it is rounded **half-even** (banker's
  rounding) exactly once, at the boundary (see :mod:`atlas_analytics.engine.rounding`).

Documented deviation from the README/ARCHITECTURE stack table (Pandas/NumPy/SciPy):
the v1 engine uses only the standard-library ``decimal`` module. IRR/NPV/payback over a few
dozen periods and a small sensitivity grid is trivially cheap, and exact, auditable decimal
arithmetic — every intermediate reproducible by hand or in a spreadsheet — is worth more than
vectorised speed at pilot scale. This is the "bank-trusted number" tradeoff: exactness > speed.
NumPy/SciPy can be introduced later behind the same function signatures if scale demands it;
the golden fixtures make that swap safe (ADR-0006 consequence #1).

None of the four mutually inconsistent prototype engines was ported (docs/CODEBASE_AUDIT.md
D-3/D-4/C-1..C-5): all formulas here are implemented from first-principles definitions and
pinned by hand-derived, closed-form golden fixtures.
"""

from atlas_analytics.engine.cashflow import (
    CostCategory,
    CostItem,
    Phasing,
    Scenario,
    build_cashflow,
    profit_agorot,
    total_cost_agorot,
)
from atlas_analytics.engine.irr import irr
from atlas_analytics.engine.npv import npv
from atlas_analytics.engine.payback import discounted_payback, simple_payback
from atlas_analytics.engine.rounding import to_agorot
from atlas_analytics.engine.sensitivity import (
    SensitivityCell,
    SensitivityGrid,
    apply_deltas,
    sensitivity_grid,
)

__all__ = [
    "CostCategory",
    "CostItem",
    "Phasing",
    "Scenario",
    "SensitivityCell",
    "SensitivityGrid",
    "apply_deltas",
    "build_cashflow",
    "discounted_payback",
    "irr",
    "npv",
    "profit_agorot",
    "sensitivity_grid",
    "simple_payback",
    "to_agorot",
    "total_cost_agorot",
]
