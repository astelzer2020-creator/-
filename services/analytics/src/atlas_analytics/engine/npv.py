"""Net present value — the standard discounted-cashflow definition.

``NPV(r, cf) = Σ_t cf_t / (1 + r)^t`` for t = 0…len(cf)-1, where ``r`` is a per-period
Decimal fraction (``Decimal("0.07")`` = 7% per period) and ``cf_t`` are integer agorot.

Returns an **unrounded** Decimal agorot amount computed at 50 significant digits; callers
that need integer agorot round exactly once at their boundary via
:func:`atlas_analytics.engine.rounding.to_agorot`.
"""

from collections.abc import Sequence
from decimal import Decimal, localcontext

_PRECISION = 50


def npv(rate_per_period: Decimal, cashflows: Sequence[int]) -> Decimal:
    """NPV in Decimal agorot at ``rate_per_period`` (decimal fraction per period, > -1).

    Zero rate degenerates exactly to the plain sum of cashflows. Raises ``ValueError`` for
    rates ≤ -1 (the discount factor would be zero or negative — economically meaningless).
    """
    if rate_per_period <= Decimal(-1):
        raise ValueError(f"rate_per_period must be > -1, got {rate_per_period}")
    with localcontext() as ctx:
        ctx.prec = _PRECISION
        base = Decimal(1) + rate_per_period
        total = Decimal(0)
        for t, cf in enumerate(cashflows):
            total += Decimal(cf) / base**t
        return total
