"""Internal rate of return — root of the NPV function itself.

Method: bracket scan + bisection **on** :func:`atlas_analytics.engine.npv.npv`, so the
invariant ``NPV(irr(cf), cf) ≈ 0`` holds by construction rather than by luck. No closed-form
or Newton shortcut is used (the prototype's clamped Newton solvers are audit findings D-4/C-4
and were not ported).

Root policy (multi-root cashflow sequences are mathematically legitimate — a sequence with
k sign changes can have up to k real IRRs, Descartes' rule):

- The search window is the open interval (-0.99, 10) per period. Roots outside it are
  treated as nonexistent — a per-period return below -99% or above 1000% is not a number
  Atlas will print on a bank report.
- If any **positive** root lies in the window, the **smallest positive** root is returned
  (the conservative choice: the lowest rate at which the project merely breaks even).
- Otherwise, if only negative roots lie in the window, the largest (least negative) one is
  returned — this is the honest IRR of a loss-making project.
- ``None`` when the cashflows have no sign change (NPV then has constant sign, no root can
  exist) or when no root lies inside the window.

Bracketing resolution: the scan uses a fixed 0.05-wide grid across the window, so two
distinct roots closer together than 0.05 may collapse into one or be missed. Documented v1
limitation; acceptable because realistic deal cashflows have one or two well-separated roots.
"""

from collections.abc import Sequence
from decimal import Decimal, localcontext

from atlas_analytics.engine.npv import npv

LOWER_BOUND = Decimal("-0.99")
UPPER_BOUND = Decimal("10")
_GRID_STEP = Decimal("0.05")
_BISECT_TOL = Decimal("1e-12")
_MAX_BISECT_ITER = 200
_PRECISION = 50


def _bisect(cashflows: Sequence[int], lo: Decimal, hi: Decimal, f_lo: Decimal) -> Decimal:
    """Bisection on npv() over a bracketing interval [lo, hi] with sign(f(lo)) = sign(f_lo)."""
    with localcontext() as ctx:
        ctx.prec = _PRECISION
        for _ in range(_MAX_BISECT_ITER):
            mid = (lo + hi) / 2
            f_mid = npv(mid, cashflows)
            if f_mid == 0 or hi - lo < _BISECT_TOL:
                return mid
            if (f_mid > 0) == (f_lo > 0):
                lo, f_lo = mid, f_mid
            else:
                hi = mid
        return (lo + hi) / 2


def irr(cashflows: Sequence[int]) -> Decimal | None:
    """IRR per period as a Decimal fraction (0.07 = 7%), or None per the module root policy."""
    has_positive = any(cf > 0 for cf in cashflows)
    has_negative = any(cf < 0 for cf in cashflows)
    if not (has_positive and has_negative):
        return None

    # Scan the window on a fixed grid, collecting exact grid roots and sign-change brackets.
    roots: list[Decimal] = []
    with localcontext() as ctx:
        ctx.prec = _PRECISION
        grid: list[Decimal] = []
        point = LOWER_BOUND + _GRID_STEP  # keep strictly inside the open window
        while point < UPPER_BOUND:
            grid.append(point)
            point += _GRID_STEP
        grid.append(UPPER_BOUND - _BISECT_TOL)

        prev_r: Decimal | None = None
        prev_f: Decimal | None = None
        for r in grid:
            f = npv(r, cashflows)
            if f == 0:
                roots.append(r)
            elif (
                prev_f is not None
                and prev_r is not None
                and prev_f != 0
                and ((f > 0) != (prev_f > 0))
            ):
                roots.append(_bisect(cashflows, prev_r, r, prev_f))
            prev_r, prev_f = r, f

    if not roots:
        return None
    positive_roots = [r for r in roots if r > 0]
    if positive_roots:
        return min(positive_roots)
    return max(roots)
