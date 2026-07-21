"""Property tests (hypothesis) — ADR-0006 invariants.

These mechanically reject fake-IRR/fake-NPV implementations of the kind the codebase audit
found in the prototype (C-4): a solver whose root is not a root of NPV cannot satisfy
NPV(irr(cf), cf) ≈ 0 across random cashflows.
"""

from decimal import Decimal

from hypothesis import assume, given, settings
from hypothesis import strategies as st

from atlas_analytics.engine import irr, npv

# Investment-shaped flows: one initial outflow, then non-negative inflows (at least one > 0).
_initial_outflow = st.integers(min_value=-(10**12), max_value=-(10**6))
_future_inflows = st.lists(
    st.integers(min_value=0, max_value=10**12), min_size=1, max_size=12
).filter(lambda tail: any(cf > 0 for cf in tail))

_rates = st.decimals(
    min_value=Decimal("-0.90"),
    max_value=Decimal("5"),
    places=6,
    allow_nan=False,
    allow_infinity=False,
)


@settings(deadline=None, max_examples=200)
@given(initial=_initial_outflow, tail=_future_inflows)
def test_npv_at_irr_is_zero(initial: int, tail: list[int]) -> None:
    """NPV(irr(cf), cf) ≈ 0 within 1e-4 relative to the cashflow magnitude, when IRR exists.

    IRR may legitimately be None when the unique root lies outside the (-0.99, 10) policy
    window (e.g. tiny outlay, huge inflow); those cases are skipped, not failed.
    """
    cashflows = [initial, *tail]
    rate = irr(cashflows)
    assume(rate is not None)
    assert rate is not None  # narrow for mypy
    residual = npv(rate, cashflows)
    scale = sum(abs(cf) for cf in cashflows)
    assert abs(residual) <= Decimal("1e-4") * scale


@settings(deadline=None, max_examples=200)
@given(initial=_initial_outflow, tail=_future_inflows, r1=_rates, r2=_rates)
def test_npv_monotonic_decreasing_for_investment_flows(
    initial: int, tail: list[int], r1: Decimal, r2: Decimal
) -> None:
    """For an initial outflow followed by non-negative inflows (some positive), NPV is
    strictly decreasing in the discount rate: only the positive future terms depend on the
    rate, and each shrinks as the rate grows."""
    assume(r1 != r2)
    low, high = sorted((r1, r2))
    cashflows = [initial, *tail]
    assert npv(low, cashflows) > npv(high, cashflows)
