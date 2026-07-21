"""Simple and discounted payback period, in fractional periods.

Definition used (documented convention, matches common spreadsheet practice):

- Cumulative cashflow is tracked from period 0. The payback period is the **first** time
  the cumulative reaches ≥ 0; later dips back below zero are ignored (first-crossing
  convention).
- Within the recovery period ``t`` the cashflow is treated as accruing linearly over
  ``(t-1, t]``, giving the fractional part: ``payback = (t-1) + (-cum_{t-1}) / cf_t``.
- A cumulative that is already ≥ 0 at period 0 gives payback 0.
- ``None`` when the cumulative never reaches zero (the project never recovers its outlay).

Discounted payback applies the same rule to cashflows discounted at a per-period Decimal
fraction rate (same DCF definition as :mod:`atlas_analytics.engine.npv`).
"""

from collections.abc import Sequence
from decimal import Decimal, localcontext

_PRECISION = 50


def _first_recovery(flows: Sequence[Decimal]) -> Decimal | None:
    cumulative = Decimal(0)
    for t, cf in enumerate(flows):
        previous = cumulative
        cumulative += cf
        if cumulative >= 0:
            if t == 0:
                return Decimal(0)
            # previous < 0 here (otherwise an earlier iteration returned), so cf > 0.
            return Decimal(t - 1) + (-previous) / cf
    return None


def simple_payback(cashflows: Sequence[int]) -> Decimal | None:
    """Fractional periods until cumulative (undiscounted) cashflow first reaches ≥ 0."""
    with localcontext() as ctx:
        ctx.prec = _PRECISION
        return _first_recovery([Decimal(cf) for cf in cashflows])


def discounted_payback(rate_per_period: Decimal, cashflows: Sequence[int]) -> Decimal | None:
    """Fractional periods until cumulative discounted cashflow first reaches ≥ 0.

    ``rate_per_period`` is a Decimal fraction per period, > -1 (ValueError otherwise).
    At rate 0 this equals :func:`simple_payback` exactly.
    """
    if rate_per_period <= Decimal(-1):
        raise ValueError(f"rate_per_period must be > -1, got {rate_per_period}")
    with localcontext() as ctx:
        ctx.prec = _PRECISION
        base = Decimal(1) + rate_per_period
        discounted = [Decimal(cf) / base**t for t, cf in enumerate(cashflows)]
        return _first_recovery(discounted)
