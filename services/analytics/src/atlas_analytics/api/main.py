"""FastAPI app for the analytics service. Run: ``uvicorn atlas_analytics.api.main:app``.

Internal-only (docs/SECURITY.md): this service is deployed on the private network and is
called solely by ``apps/api``, which enforces authentication and roles. OpenAPI is exposed
(``/openapi.json``) and published as a build artifact — the gateway's client is generated
from it (docs/TESTING_STRATEGY.md, contract section).

Wire contract: exactly the shared schemas (``packages/shared/src/schemas``) — see
``api/models.py`` for the field-by-field mapping and the v1 single-year timeline convention.
"""

from decimal import Decimal

from fastapi import FastAPI, HTTPException

from atlas_analytics import __version__
from atlas_analytics.api.models import (
    HealthResponse,
    SensitivityGridOut,
    SimulateRequest,
    SimulateResponse,
    format_decimal,
)
from atlas_analytics.engine.cashflow import (
    Scenario,
    build_cashflow,
    profit_agorot,
    total_cost_agorot,
)
from atlas_analytics.engine.irr import irr
from atlas_analytics.engine.npv import npv
from atlas_analytics.engine.payback import simple_payback
from atlas_analytics.engine.rounding import to_agorot
from atlas_analytics.engine.sensitivity import sensitivity_grid

app = FastAPI(
    title="Atlas Analytics",
    version=__version__,
    description="Internal financial engine: IRR, NPV, payback, sensitivity. Never internet-facing.",
)

# Fixed v1 sensitivity axes (shared SimulationRequestSchema carries no sensitivity options):
# ±10% / ±5% around the base case on both the sale-price and build-cost axes.
SENSITIVITY_DELTAS: tuple[Decimal, ...] = (
    Decimal("-0.10"),
    Decimal("-0.05"),
    Decimal("0"),
    Decimal("0.05"),
    Decimal("0.10"),
)


@app.get("/healthz", response_model=HealthResponse)
def healthz() -> HealthResponse:
    """Liveness: process is up."""
    return HealthResponse(status="ok")


@app.get("/readyz", response_model=HealthResponse)
def readyz() -> HealthResponse:
    """Readiness: stateless service — ready whenever live (no downstream dependencies in M1)."""
    return HealthResponse(status="ok")


def _roi_on_cost(scenario: Scenario) -> float | None:
    """Profit / total cost as a float fraction; None when the scenario has zero cost."""
    total_cost = total_cost_agorot(scenario)
    if total_cost == 0:
        return None
    return float(Decimal(profit_agorot(scenario)) / Decimal(total_cost))


@app.post("/v1/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest) -> SimulateResponse:
    """Run one scenario: IRR, NPV, profit, ROI-on-cost, payback, sensitivity grid."""
    try:
        scenario = request.to_engine()
    except ValueError as exc:
        # Cross-field domain validation (e.g. negative derived revenue) lives in the engine.
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    rate = request.discount_rate_decimal()
    cashflows = build_cashflow(scenario)
    grid = sensitivity_grid(scenario, rate, SENSITIVITY_DELTAS, SENSITIVITY_DELTAS)

    base_irr = irr(cashflows)
    payback = simple_payback(cashflows)
    return SimulateResponse(
        irr=None if base_irr is None else format_decimal(base_irr),
        npv_agorot=to_agorot(npv(rate, cashflows)),
        profit_agorot=profit_agorot(scenario),
        roi_on_cost=_roi_on_cost(scenario),
        payback_years=None if payback is None else float(payback),
        sensitivity=SensitivityGridOut(
            price_deltas=[float(d) for d in grid.price_deltas],
            cost_deltas=[float(d) for d in grid.cost_deltas],
            # Shared orientation: npvAgorot[i][j] ↔ (costDeltas[i], priceDeltas[j]);
            # the engine grid is cells[price][cost], so serialize the transpose.
            npv_agorot=[
                [grid.cells[j][i].npv_agorot for j in range(len(grid.price_deltas))]
                for i in range(len(grid.cost_deltas))
            ],
        ),
    )
