from fastapi import APIRouter
from models.schemas import ROIInput, ROIResult, BatchROIInput
import numpy as np

router = APIRouter()


def calculate_irr(cashflows: list, max_iter: int = 1000, tol: float = 1e-6) -> float:
    """Newton-Raphson IRR calculation."""
    rate = 0.1
    for _ in range(max_iter):
        npv = sum(cf / (1 + rate) ** t for t, cf in enumerate(cashflows))
        d_npv = sum(-t * cf / (1 + rate) ** (t + 1) for t, cf in enumerate(cashflows))
        if abs(d_npv) < 1e-12:
            break
        new_rate = rate - npv / d_npv
        if abs(new_rate - rate) < tol:
            rate = new_rate
            break
        rate = new_rate
    return rate * 100 if -1 < rate < 10 else 0.0


def compute_roi(inp: ROIInput) -> dict:
    total_units = inp.existingUnits + inp.addedUnits

    revenue = inp.addedUnits * inp.avgUnitSize * inp.salePrice
    construction = total_units * inp.avgUnitSize * inp.buildCost
    tenant = inp.existingUnits * inp.tenantCompensation * 12 * inp.projectYears
    demolition = inp.landArea * 200 if any(k in inp.planType for k in ['הריסה', 'פינוי']) else 0
    permits = revenue * 0.035
    finance = construction * (inp.financeRate / 100) * inp.projectYears
    total_cost = construction + tenant + demolition + permits + finance
    profit = revenue - total_cost
    roi = (profit / total_cost * 100) if total_cost > 0 else 0

    # Build annual cashflows for IRR
    annual_construction = construction / inp.projectYears
    cashflows = [-annual_construction - tenant / inp.projectYears] * inp.projectYears
    cashflows[-1] += revenue  # revenue at end
    irr = calculate_irr(cashflows)

    npv = profit / (1 + inp.financeRate / 100) ** inp.projectYears
    breakeven = total_cost / (inp.addedUnits * inp.avgUnitSize) if inp.addedUnits > 0 else 0

    # Payback period (simple)
    cumulative = 0
    payback = None
    annual_income = revenue / max(inp.projectYears, 1)
    for yr in range(1, 30):
        cumulative += annual_income - annual_construction
        if cumulative >= 0:
            payback = yr
            break

    return {
        "revenue": round(revenue, 2),
        "constructionCost": round(construction, 2),
        "tenantCost": round(tenant, 2),
        "demolitionCost": round(demolition, 2),
        "permits": round(permits, 2),
        "financeCost": round(finance, 2),
        "totalCost": round(total_cost, 2),
        "profit": round(profit, 2),
        "roi": round(roi, 2),
        "irr": round(irr, 2),
        "npv": round(npv, 2),
        "paybackYears": payback,
        "totalNewUnits": total_units,
        "breakeven_price_per_sqm": round(breakeven, 2),
    }


@router.post("/calculate", response_model=ROIResult)
def calculate(inp: ROIInput):
    return compute_roi(inp)


@router.post("/batch")
def batch_calculate(inp: BatchROIInput):
    results = [compute_roi(p) for p in inp.projects]
    avg_roi = np.mean([r["roi"] for r in results]) if results else 0
    return {"results": results, "count": len(results), "averageROI": round(avg_roi, 2)}


@router.post("/sensitivity")
def sensitivity(inp: ROIInput):
    """Sensitivity analysis: vary sale price ±30% in 7 steps."""
    base = inp.salePrice
    steps = np.linspace(base * 0.7, base * 1.3, 7)
    results = []
    for price in steps:
        mod = inp.model_copy(update={"salePrice": float(price)})
        r = compute_roi(mod)
        results.append({"salePrice": round(float(price)), "roi": r["roi"], "profit": r["profit"]})
    return {"sensitivity": results, "baseCase": compute_roi(inp)}
