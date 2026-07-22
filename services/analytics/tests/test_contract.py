"""HTTP contract tests: POST /v1/simulate speaks EXACTLY the shared schemas.

Authority: packages/shared/src/schemas/scenario.ts (SimulationRequestSchema, camelCase
apartmentMix/costItems/discountRate) and simulation.ts (SimulationResultSchema). The old
snake_case engine-shaped wire (scenario/num_periods/...) is gone; engine-level semantics
(phasing, multi-period) remain covered by the golden suite at the function level.

The round-trip case is hand-derived under the v1 single-year convention (api/models.py):
costs at period 0, revenue at period 1, periods are years.
"""

from decimal import Decimal

from fastapi.testclient import TestClient

from atlas_analytics.api.main import app

client = TestClient(app)

# Hand-derivation (atlas-cto, 2026-07-21):
#   revenue = 2 units x 100 m² x 10,000 agorot/m² = 2,000,000 agorot (exact, no rounding)
#   cost    = 1,000,000 agorot → cashflows [-1,000,000, +2,000,000]
#   rate 0.25 → NPV = -1,000,000 + 2,000,000/1.25 = 600,000 agorot exact
#   profit  = 1,000,000; roiOnCost = 1,000,000/1,000,000 = 1.0
#   IRR: -1e6 + 2e6/(1+r) = 0 → r = 1.0 exactly (solver tolerance 1e-4)
#   payback = 0 + 1,000,000/2,000,000 = 0.5 periods = 0.5 years
REQUEST = {
    "apartmentMix": [
        {"label": "3 חדרים", "units": 2, "areaSqm": 100, "salePricePerSqmAgorot": 10_000}
    ],
    "costItems": [{"label": "עלות בנייה", "amountAgorot": 1_000_000}],
    "discountRate": 0.25,
}

SHARED_RESULT_KEYS = {
    "irr",
    "npvAgorot",
    "profitAgorot",
    "roiOnCost",
    "paybackYears",
    "sensitivity",
}
SHARED_GRID_KEYS = {"priceDeltas", "costDeltas", "npvAgorot"}


def test_health_endpoints() -> None:
    assert client.get("/healthz").json() == {"status": "ok"}
    assert client.get("/readyz").json() == {"status": "ok"}


def test_openapi_exposed() -> None:
    schema = client.get("/openapi.json").json()
    assert "/v1/simulate" in schema["paths"]


def test_simulate_round_trip_shared_shape() -> None:
    response = client.post("/v1/simulate", json=REQUEST)
    assert response.status_code == 200, response.text
    body = response.json()

    # Envelope: exactly the shared SimulationResultSchema keys, camelCase, nothing extra.
    assert set(body.keys()) == SHARED_RESULT_KEYS
    assert set(body["sensitivity"].keys()) == SHARED_GRID_KEYS

    # Monetary outputs: exact integer agorot.
    assert body["npvAgorot"] == 600_000
    assert body["profitAgorot"] == 1_000_000
    # Ratios are JSON numbers per shared; irr stays a decimal string.
    assert isinstance(body["roiOnCost"], float | int)
    assert abs(body["roiOnCost"] - 1.0) <= 1e-9
    assert body["paybackYears"] == 0.5
    assert isinstance(body["irr"], str)
    assert abs(Decimal(body["irr"]) - 1) <= Decimal("1e-4")


def test_sensitivity_grid_shared_orientation() -> None:
    """npvAgorot[i][j] ↔ (costDeltas[i], priceDeltas[j]) — cost rows, price columns."""
    body = client.post("/v1/simulate", json=REQUEST).json()
    grid = body["sensitivity"]
    assert grid["priceDeltas"] == [-0.1, -0.05, 0, 0.05, 0.1]
    assert grid["costDeltas"] == [-0.1, -0.05, 0, 0.05, 0.1]
    assert len(grid["npvAgorot"]) == 5
    assert all(len(row) == 5 for row in grid["npvAgorot"])
    # Center cell (0, 0 deltas) reproduces the base case exactly.
    assert grid["npvAgorot"][2][2] == body["npvAgorot"] == 600_000
    # Orientation proof (hand-derived): cost +10% & price -10% → cost 1.1e6, revenue 1.8e6,
    # NPV = -1,100,000 + 1,800,000/1.25 = 340,000 — must sit at [cost row 4][price col 0].
    assert grid["npvAgorot"][4][0] == 340_000
    # The transposed position differs: cost -10% & price +10% →
    # NPV = -900,000 + 2,200,000/1.25 = 860,000.
    assert grid["npvAgorot"][0][4] == 860_000


def test_fractional_area_rounds_half_even_once_per_line() -> None:
    """3 x 10.5 m² x 1,001 agorot/m² = 31,531.5 → half-even → 31,532 agorot revenue."""
    body = client.post(
        "/v1/simulate",
        json={
            "apartmentMix": [
                {"label": "קטן", "units": 3, "areaSqm": 10.5, "salePricePerSqmAgorot": 1_001}
            ],
            "costItems": [{"label": "בנייה", "amountAgorot": 10_000}],
            "discountRate": 0,
        },
    ).json()
    assert body["profitAgorot"] == 31_532 - 10_000
    assert body["npvAgorot"] == 31_532 - 10_000  # rate 0 → plain sum


def test_zero_total_cost_yields_null_roi_never_a_fabricated_number() -> None:
    body = client.post(
        "/v1/simulate",
        json={
            "apartmentMix": [
                {"label": "3 חדרים", "units": 1, "areaSqm": 100, "salePricePerSqmAgorot": 10_000}
            ],
            "costItems": [{"label": "ללא עלות", "amountAgorot": 0}],
            "discountRate": 0.25,
        },
    ).json()
    assert body["roiOnCost"] is None
    assert body["irr"] is None  # no negative cashflow → no IRR
    assert body["paybackYears"] == 0  # nothing to recover


def test_rejects_percent_point_discount_rate() -> None:
    """discountRate is a decimal fraction in [0, 1] (0.07, never 7) — shared RateFraction."""
    response = client.post("/v1/simulate", json={**REQUEST, "discountRate": 7})
    assert response.status_code == 422


def test_rejects_unknown_fields_and_legacy_snake_case_envelope() -> None:
    response = client.post(
        "/v1/simulate",
        json={
            "scenario": {"num_periods": 1},
            "discount_rate_per_period": "0.1",
        },
    )
    assert response.status_code == 422


def test_rejects_empty_mix_and_empty_cost_items() -> None:
    assert client.post("/v1/simulate", json={**REQUEST, "apartmentMix": []}).status_code == 422
    assert client.post("/v1/simulate", json={**REQUEST, "costItems": []}).status_code == 422
