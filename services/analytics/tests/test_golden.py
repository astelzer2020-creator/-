"""Golden-file suite (ADR-0006): every fixture in tests/golden/ is executed and compared.

Tolerance policy (docs/TESTING_STRATEGY.md): integer-agorot keys exact; ``irr`` at 1e-4
relative (iterative solver); pure-math decimals (paybacks, roi) at 1e-9 relative. Only keys
present in a fixture's ``expected`` block are asserted — a fixture pins what was hand-derived.
"""

import json
from decimal import Decimal
from pathlib import Path
from typing import Any

import pytest

from atlas_analytics.api.models import ScenarioIn
from atlas_analytics.engine import (
    build_cashflow,
    discounted_payback,
    irr,
    npv,
    profit_agorot,
    simple_payback,
    to_agorot,
    total_cost_agorot,
)

GOLDEN_DIR = Path(__file__).parent / "golden"
FIXTURES = sorted(GOLDEN_DIR.glob("*.json"))

_SOLVER_TOL = Decimal("1e-4")
_PURE_MATH_TOL = Decimal("1e-9")
_EXACT_KEYS = {"npv_agorot", "profit_agorot", "cashflows_agorot"}
_TOLERANCES = {
    "irr": _SOLVER_TOL,
    "payback_periods": _PURE_MATH_TOL,
    "discounted_payback_periods": _PURE_MATH_TOL,
    "roi_on_cost": _PURE_MATH_TOL,
}


def _assert_close(key: str, actual: Decimal | None, expected: str | None) -> None:
    if expected is None:
        assert actual is None, f"{key}: expected null, got {actual}"
        return
    assert actual is not None, f"{key}: expected {expected}, got None"
    expected_dec = Decimal(expected)
    tolerance = _TOLERANCES[key]
    bound = tolerance * max(abs(expected_dec), Decimal(1))
    assert abs(actual - expected_dec) <= bound, f"{key}: |{actual} - {expected_dec}| > {bound}"


def _compute(fixture: dict[str, Any]) -> dict[str, Any]:
    rate = Decimal(fixture["input"]["discount_rate_per_period"])
    results: dict[str, Any] = {}
    if fixture["kind"] == "cashflows":
        cashflows: list[int] = fixture["input"]["cashflows"]
    else:
        scenario = ScenarioIn.model_validate(fixture["input"]["scenario"]).to_engine()
        cashflows = build_cashflow(scenario)
        results["profit_agorot"] = profit_agorot(scenario)
        total_cost = total_cost_agorot(scenario)
        results["roi_on_cost"] = (
            None if total_cost == 0 else Decimal(profit_agorot(scenario)) / Decimal(total_cost)
        )
    results["cashflows_agorot"] = cashflows
    results["irr"] = irr(cashflows)
    results["npv_agorot"] = to_agorot(npv(rate, cashflows))
    results["payback_periods"] = simple_payback(cashflows)
    results["discounted_payback_periods"] = discounted_payback(rate, cashflows)
    return results


def test_fixture_inventory() -> None:
    """ADR-0006 hygiene: at least 8 fixtures, every one carrying a named verifier."""
    assert len(FIXTURES) >= 8
    for path in FIXTURES:
        fixture = json.loads(path.read_text(encoding="utf-8"))
        assert "hand-derived" in fixture["verifier"], f"{path.name}: unnamed verifier"
        assert fixture["derivation"], f"{path.name}: missing derivation"


@pytest.mark.parametrize("path", FIXTURES, ids=lambda p: p.stem)
def test_golden(path: Path) -> None:
    fixture = json.loads(path.read_text(encoding="utf-8"))
    computed = _compute(fixture)
    for key, expected in fixture["expected"].items():
        if key in _EXACT_KEYS:
            assert computed[key] == expected, f"{key}: expected {expected}, got {computed[key]}"
        else:
            _assert_close(key, computed[key], expected)
