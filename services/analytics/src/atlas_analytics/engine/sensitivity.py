"""Two-axis sensitivity grid: sale price x build cost.

For each pair of deltas (Decimal fractions, e.g. ``Decimal("-0.10")`` = -10%):

- total revenue is scaled by ``1 + price_delta``;
- every cost item in category ``CONSTRUCTION`` is scaled by ``1 + cost_delta``; other cost
  categories (demolition, planning, financing, other) are held fixed — the grid isolates the
  two variables the pilot cares about (docs/pilot scope);
- scaled amounts are rounded to integer agorot half-even (once, at scaling time), then the
  scaled scenario runs through the same cashflow/NPV/IRR pipeline as the base case.

Grid orientation: ``cells[i][j]`` is row ``price_deltas[i]``, column ``cost_deltas[j]``.
A delta of 0 on both axes reproduces the base scenario exactly (no scaling artifacts:
scaling by ``1 + 0`` is the identity on integers).
"""

from collections.abc import Sequence
from dataclasses import dataclass, replace
from decimal import Decimal

from atlas_analytics.engine.cashflow import (
    CostCategory,
    Scenario,
    build_cashflow,
    profit_agorot,
)
from atlas_analytics.engine.irr import irr
from atlas_analytics.engine.npv import npv
from atlas_analytics.engine.rounding import to_agorot


@dataclass(frozen=True)
class SensitivityCell:
    """Outcome of one scaled scenario. Monetary fields are integer agorot."""

    irr: Decimal | None
    npv_agorot: int
    profit_agorot: int


@dataclass(frozen=True)
class SensitivityGrid:
    """cells[i][j] ↔ (price_deltas[i], cost_deltas[j])."""

    price_deltas: tuple[Decimal, ...]
    cost_deltas: tuple[Decimal, ...]
    cells: tuple[tuple[SensitivityCell, ...], ...]


def _scale_agorot(amount_agorot: int, factor: Decimal) -> int:
    """Scale integer agorot by a Decimal factor, rounding half-even to whole agorot."""
    return to_agorot(Decimal(amount_agorot) * factor)


def apply_deltas(scenario: Scenario, price_delta: Decimal, cost_delta: Decimal) -> Scenario:
    """Return a copy of ``scenario`` with revenue and construction costs scaled."""
    price_factor = Decimal(1) + price_delta
    cost_factor = Decimal(1) + cost_delta
    scaled_costs = tuple(
        replace(item, amount_agorot=_scale_agorot(item.amount_agorot, cost_factor))
        if item.category is CostCategory.CONSTRUCTION
        else item
        for item in scenario.cost_items
    )
    return replace(
        scenario,
        total_revenue_agorot=_scale_agorot(scenario.total_revenue_agorot, price_factor),
        cost_items=scaled_costs,
    )


def sensitivity_grid(
    scenario: Scenario,
    discount_rate_per_period: Decimal,
    price_deltas: Sequence[Decimal],
    cost_deltas: Sequence[Decimal],
) -> SensitivityGrid:
    """IRR/NPV/profit over the price x cost delta grid (see module docstring)."""
    rows: list[tuple[SensitivityCell, ...]] = []
    for price_delta in price_deltas:
        row: list[SensitivityCell] = []
        for cost_delta in cost_deltas:
            scaled = apply_deltas(scenario, price_delta, cost_delta)
            cashflows = build_cashflow(scaled)
            row.append(
                SensitivityCell(
                    irr=irr(cashflows),
                    npv_agorot=to_agorot(npv(discount_rate_per_period, cashflows)),
                    profit_agorot=profit_agorot(scaled),
                )
            )
        rows.append(tuple(row))
    return SensitivityGrid(
        price_deltas=tuple(price_deltas),
        cost_deltas=tuple(cost_deltas),
        cells=tuple(rows),
    )
