"""FastAPI app for the analytics service. Run: ``uvicorn atlas_analytics.api.main:app``.

Internal-only (docs/SECURITY.md): this service is deployed on the private network and is
called solely by ``apps/api``, which enforces authentication and roles. OpenAPI is exposed
(``/openapi.json``) and published as a build artifact — the gateway's client is generated
from it (docs/TESTING_STRATEGY.md, contract section).
"""

from decimal import Decimal

from fastapi import FastAPI, HTTPException

from atlas_analytics import __version__
from atlas_analytics.api.models import (
    HealthResponse,
    SensitivityCellOut,
    SensitivityGridOut,
    SimulateRequest,
    SimulateResponse,
    format_decimal,
    parse_decimal,
)
from atlas_analytics.engine.cashflow import (
    Scenario,
    build_cashflow,
    profit_agorot,
    total_cost_agorot,
)
from atlas_analytics.engine.irr import irr
from atlas_analytics.engine.npv import npv
from atlas_analytics.engine.payback import discounted_payback, simple_payback
from atlas_analytics.engine.rounding import to_agorot
from atlas_analytics.engine.sensitivity import sensitivity_grid

app = FastAPI(
    title="Atlas Analytics",
    version=__version__,
    description="Internal financial engine: IRR, NPV, payback, sensitivity. Never internet-facing.",
)


@app.get("/healthz", response_model=HealthResponse)
def healthz() -> HealthResponse:
    """Liveness: process is up."""
    return HealthResponse(status="ok")


@app.get("/readyz", response_model=HealthResponse)
def readyz() -> HealthResponse:
    """Readiness: stateless service — ready whenever live (no downstream dependencies in M1)."""
    return HealthResponse(status="ok")


def _opt(value: Decimal | None) -> str | None:
    return None if value is None else format_decimal(value)


def _roi_on_cost(scenario: Scenario) -> Decimal | None:
    """Profit / total cost as a Decimal fraction; None when the scenario has zero cost."""
    total_cost = total_cost_agorot(scenario)
    if total_cost == 0:
        return None
    return Decimal(profit_agorot(scenario)) / Decimal(total_cost)


@app.post("/v1/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest) -> SimulateResponse:
    """Run one scenario: cashflows, IRR, NPV, profit, ROI-on-cost, paybacks, sensitivity."""
    try:
        scenario = request.scenario.to_engine()
    except ValueError as exc:
        # Cross-field validation (phasing windows vs num_periods) lives in the engine model.
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    rate = parse_decimal(request.discount_rate_per_period)
    if rate <= Decimal(-1):
        raise HTTPException(status_code=422, detail="discount_rate_per_period must be > -1")

    cashflows = build_cashflow(scenario)
    price_deltas = [parse_decimal(d) for d in request.sensitivity.price_deltas]
    cost_deltas = [parse_decimal(d) for d in request.sensitivity.cost_deltas]
    grid = sensitivity_grid(scenario, rate, price_deltas, cost_deltas)

    return SimulateResponse(
        irr=_opt(irr(cashflows)),
        npv_agorot=to_agorot(npv(rate, cashflows)),
        profit_agorot=profit_agorot(scenario),
        roi_on_cost=_opt(_roi_on_cost(scenario)),
        payback_periods=_opt(simple_payback(cashflows)),
        discounted_payback_periods=_opt(discounted_payback(rate, cashflows)),
        cashflows_agorot=cashflows,
        sensitivity=SensitivityGridOut(
            price_deltas=[format_decimal(d) for d in grid.price_deltas],
            cost_deltas=[format_decimal(d) for d in grid.cost_deltas],
            cells=[
                [
                    SensitivityCellOut(
                        irr=_opt(cell.irr),
                        npv_agorot=cell.npv_agorot,
                        profit_agorot=cell.profit_agorot,
                    )
                    for cell in row
                ]
                for row in grid.cells
            ],
        ),
    )
