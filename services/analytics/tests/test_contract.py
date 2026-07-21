"""HTTP contract test: golden fixture 08 round-tripped through POST /v1/simulate.

Verifies the wire contract (agorot as JSON ints, rates/fractions as decimal strings,
nullable irr/paybacks) — not just the engine functions — per docs/TESTING_STRATEGY.md's
"contract between API and analytics" section.
"""

import json
from decimal import Decimal
from pathlib import Path

from fastapi.testclient import TestClient

from atlas_analytics.api.main import app

FIXTURE = Path(__file__).parent / "golden" / "08_scenario_linear_phasing.json"

client = TestClient(app)


def test_health_endpoints() -> None:
    assert client.get("/healthz").json() == {"status": "ok"}
    assert client.get("/readyz").json() == {"status": "ok"}


def test_openapi_exposed() -> None:
    schema = client.get("/openapi.json").json()
    assert "/v1/simulate" in schema["paths"]


def test_simulate_round_trip_golden_08() -> None:
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    response = client.post(
        "/v1/simulate",
        json={
            "scenario": fixture["input"]["scenario"],
            "discount_rate_per_period": fixture["input"]["discount_rate_per_period"],
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()

    expected = fixture["expected"]
    # Monetary outputs: exact integer agorot.
    assert body["cashflows_agorot"] == expected["cashflows_agorot"]
    assert body["npv_agorot"] == expected["npv_agorot"]
    assert body["profit_agorot"] == expected["profit_agorot"]
    # Fractions travel as decimal strings; compare as Decimal (pure math, 1e-9 relative).
    assert Decimal(body["roi_on_cost"]) == Decimal(expected["roi_on_cost"])
    for key in ("payback_periods", "discounted_payback_periods"):
        actual, want = Decimal(body[key]), Decimal(expected[key])
        assert abs(actual - want) <= Decimal("1e-9") * max(abs(want), Decimal(1))
    # IRR exists for this shape but is unpinned (no closed form); contract requires a
    # decimal string parseable and inside the solver's policy window.
    assert body["irr"] is not None
    assert Decimal("-0.99") < Decimal(body["irr"]) < Decimal("10")

    # Sensitivity grid: default 5x5; the (0, 0)-delta center cell must equal the base case.
    grid = body["sensitivity"]
    assert grid["price_deltas"] == ["-0.1", "-0.05", "0", "0.05", "0.1"]
    assert grid["cost_deltas"] == ["-0.1", "-0.05", "0", "0.05", "0.1"]
    assert len(grid["cells"]) == 5 and all(len(row) == 5 for row in grid["cells"])
    center = grid["cells"][2][2]
    assert center["npv_agorot"] == expected["npv_agorot"]
    assert center["profit_agorot"] == expected["profit_agorot"]
    assert center["irr"] == body["irr"]


def test_simulate_rejects_bad_phasing() -> None:
    """Cross-field validation surfaces as 422, not a 500."""
    response = client.post(
        "/v1/simulate",
        json={
            "scenario": {
                "num_periods": 2,
                "total_revenue_agorot": 100,
                "revenue_phasing": {"start_period": 0, "end_period": 5},
                "cost_items": [],
            },
            "discount_rate_per_period": "0.1",
        },
    )
    assert response.status_code == 422


def test_simulate_rejects_non_decimal_rate() -> None:
    response = client.post(
        "/v1/simulate",
        json={
            "scenario": {
                "num_periods": 1,
                "total_revenue_agorot": 100,
                "revenue_phasing": {"start_period": 1, "end_period": 1},
                "cost_items": [],
            },
            "discount_rate_per_period": "not-a-number",
        },
    )
    assert response.status_code == 422
