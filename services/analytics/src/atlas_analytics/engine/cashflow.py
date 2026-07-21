"""Scenario model and period-cashflow construction.

A :class:`Scenario` describes one urban-renewal deal in integer agorot:
total revenue, a list of cost items (construction, demolition, planning, financing, …),
and *when* each amount lands, as a :class:`Phasing` window of periods.

Phasing model (v1, deliberately simple and documented):
    Each amount is spread **linearly** (equal integer parts) across the inclusive period
    window ``[start_period, end_period]``. Because amounts are integer agorot, the split is
    exact: each period receives ``floor(amount / n_periods)`` and the remainder is handed out
    one agora at a time to the earliest periods of the window. No agora is ever created or
    lost by phasing. Non-linear phasing curves (S-curve draws, milestone payments) are an M2
    concern and will extend :class:`Phasing`, not change cashflow semantics.

Period convention: period 0 is "today"; a scenario with ``num_periods = N`` produces a
cashflow list of length ``N + 1`` indexed by period 0…N. The period length (month/quarter/
year) is the caller's convention — all rates elsewhere in the engine are *per period*.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class CostCategory(StrEnum):
    """Cost buckets. ``CONSTRUCTION`` is the axis scaled by build-cost sensitivity."""

    CONSTRUCTION = "construction"
    DEMOLITION = "demolition"
    PLANNING = "planning"
    FINANCING = "financing"
    OTHER = "other"


@dataclass(frozen=True)
class Phasing:
    """Inclusive period window ``[start_period, end_period]`` over which an amount is spread."""

    start_period: int
    end_period: int

    def __post_init__(self) -> None:
        if self.start_period < 0:
            raise ValueError(f"start_period must be >= 0, got {self.start_period}")
        if self.end_period < self.start_period:
            raise ValueError(
                f"end_period ({self.end_period}) must be >= start_period ({self.start_period})"
            )

    @property
    def n_periods(self) -> int:
        return self.end_period - self.start_period + 1


@dataclass(frozen=True)
class CostItem:
    """One cost line in integer agorot, phased across its window."""

    name: str
    category: CostCategory
    amount_agorot: int
    phasing: Phasing

    def __post_init__(self) -> None:
        if self.amount_agorot < 0:
            raise ValueError(f"cost amount_agorot must be >= 0, got {self.amount_agorot}")


@dataclass(frozen=True)
class Scenario:
    """One deal: revenue + costs in integer agorot, each with a phasing window.

    ``num_periods`` is the index of the last period (cashflows cover periods 0…num_periods).
    """

    num_periods: int
    total_revenue_agorot: int
    revenue_phasing: Phasing
    cost_items: tuple[CostItem, ...]

    def __post_init__(self) -> None:
        if self.num_periods < 1:
            raise ValueError(f"num_periods must be >= 1, got {self.num_periods}")
        if self.total_revenue_agorot < 0:
            raise ValueError(f"total_revenue_agorot must be >= 0, got {self.total_revenue_agorot}")
        if self.revenue_phasing.end_period > self.num_periods:
            raise ValueError("revenue_phasing extends past num_periods")
        for item in self.cost_items:
            if item.phasing.end_period > self.num_periods:
                raise ValueError(f"cost item '{item.name}' phasing extends past num_periods")


def _split_evenly(amount_agorot: int, parts: int) -> list[int]:
    """Split non-negative integer agorot into ``parts`` near-equal integer parts, exactly.

    Each part gets ``floor(amount / parts)``; the remainder is distributed one agora each to
    the earliest parts. Deterministic and lossless: ``sum(result) == amount_agorot`` always.
    """
    base, remainder = divmod(amount_agorot, parts)
    return [base + 1 if i < remainder else base for i in range(parts)]


def build_cashflow(scenario: Scenario) -> list[int]:
    """Net period cashflows in integer agorot for periods 0…num_periods.

    ``cashflow[t] = revenue landing in t - costs landing in t`` under the linear phasing
    model documented at module level. Integer arithmetic throughout — no rounding occurs.
    """
    flows = [0] * (scenario.num_periods + 1)
    revenue_parts = _split_evenly(scenario.total_revenue_agorot, scenario.revenue_phasing.n_periods)
    for offset, part in enumerate(revenue_parts):
        flows[scenario.revenue_phasing.start_period + offset] += part
    for item in scenario.cost_items:
        cost_parts = _split_evenly(item.amount_agorot, item.phasing.n_periods)
        for offset, part in enumerate(cost_parts):
            flows[item.phasing.start_period + offset] -= part
    return flows


def total_cost_agorot(scenario: Scenario) -> int:
    """Sum of all cost items in integer agorot."""
    return sum(item.amount_agorot for item in scenario.cost_items)


def profit_agorot(scenario: Scenario) -> int:
    """Undiscounted profit: total revenue - total costs, integer agorot (exact)."""
    return scenario.total_revenue_agorot - total_cost_agorot(scenario)
