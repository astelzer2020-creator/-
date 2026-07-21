"""Unit tests for engine building blocks not already pinned by golden fixtures:
validation errors, boundary rounding, integer splitting, sensitivity scaling."""

from decimal import Decimal

import pytest

from atlas_analytics.engine import (
    CostCategory,
    CostItem,
    Phasing,
    Scenario,
    apply_deltas,
    irr,
    npv,
    sensitivity_grid,
    to_agorot,
)
from atlas_analytics.engine.cashflow import _split_evenly
from atlas_analytics.engine.sensitivity import _scale_agorot


class TestRounding:
    def test_half_even_ties(self) -> None:
        assert to_agorot(Decimal("2.5")) == 2
        assert to_agorot(Decimal("3.5")) == 4
        assert to_agorot(Decimal("-2.5")) == -2

    def test_non_ties(self) -> None:
        assert to_agorot(Decimal("818181.8181")) == 818182
        assert to_agorot(Decimal("-181818.18")) == -181818


class TestSplitEvenly:
    def test_exact_division(self) -> None:
        assert _split_evenly(3000000, 2) == [1500000, 1500000]

    def test_remainder_goes_to_earliest(self) -> None:
        assert _split_evenly(1000001, 3) == [333334, 333334, 333333]

    def test_lossless(self) -> None:
        for amount, parts in ((7, 3), (0, 4), (10**12 + 17, 7)):
            assert sum(_split_evenly(amount, parts)) == amount


class TestValidation:
    def test_phasing_rejects_negative_start(self) -> None:
        with pytest.raises(ValueError, match="start_period"):
            Phasing(start_period=-1, end_period=0)

    def test_phasing_rejects_end_before_start(self) -> None:
        with pytest.raises(ValueError, match="end_period"):
            Phasing(start_period=3, end_period=2)

    def test_cost_item_rejects_negative_amount(self) -> None:
        with pytest.raises(ValueError, match="amount_agorot"):
            CostItem("x", CostCategory.OTHER, -1, Phasing(0, 0))

    def test_scenario_rejects_phasing_past_horizon(self) -> None:
        with pytest.raises(ValueError, match="num_periods"):
            Scenario(
                num_periods=2,
                total_revenue_agorot=0,
                revenue_phasing=Phasing(0, 3),
                cost_items=(),
            )

    def test_npv_rejects_rate_at_or_below_minus_one(self) -> None:
        with pytest.raises(ValueError, match="rate_per_period"):
            npv(Decimal("-1"), [-100, 200])


class TestIrrEdges:
    def test_all_positive_flows_none(self) -> None:
        assert irr([100, 200]) is None

    def test_all_negative_flows_none(self) -> None:
        assert irr([-100, -200]) is None

    def test_financing_shaped_flow(self) -> None:
        # Borrow 100,000 now, repay 200,000 next period: 100,000 = 200,000/(1+r) => r = 1.
        result = irr([100000, -200000])
        assert result is not None
        assert abs(result - 1) <= Decimal("1e-4")


class TestSensitivityScaling:
    def test_scale_rounds_half_even(self) -> None:
        assert _scale_agorot(25, Decimal("0.1")) == 2  # 2.5 -> 2
        assert _scale_agorot(35, Decimal("0.1")) == 4  # 3.5 -> 4

    def test_zero_deltas_are_identity(self) -> None:
        scenario = Scenario(
            num_periods=2,
            total_revenue_agorot=333,
            revenue_phasing=Phasing(2, 2),
            cost_items=(CostItem("build", CostCategory.CONSTRUCTION, 111, Phasing(0, 0)),),
        )
        assert apply_deltas(scenario, Decimal(0), Decimal(0)) == scenario

    def test_only_construction_costs_scale(self) -> None:
        scenario = Scenario(
            num_periods=2,
            total_revenue_agorot=1000,
            revenue_phasing=Phasing(2, 2),
            cost_items=(
                CostItem("build", CostCategory.CONSTRUCTION, 100, Phasing(0, 0)),
                CostItem("plan", CostCategory.PLANNING, 100, Phasing(0, 0)),
            ),
        )
        scaled = apply_deltas(scenario, Decimal(0), Decimal("0.10"))
        amounts = {item.name: item.amount_agorot for item in scaled.cost_items}
        assert amounts == {"build": 110, "plan": 100}
        assert scaled.total_revenue_agorot == 1000

    def test_grid_shape_and_orientation(self) -> None:
        scenario = Scenario(
            num_periods=1,
            total_revenue_agorot=2000,
            revenue_phasing=Phasing(1, 1),
            cost_items=(CostItem("build", CostCategory.CONSTRUCTION, 1000, Phasing(0, 0)),),
        )
        grid = sensitivity_grid(
            scenario,
            Decimal(0),
            price_deltas=[Decimal("-0.5"), Decimal(0)],
            cost_deltas=[Decimal(0), Decimal("0.5"), Decimal(1)],
        )
        assert len(grid.cells) == 2 and all(len(row) == 3 for row in grid.cells)
        # Row 0 = price -50% (revenue 1000); col 2 = cost +100% (cost 2000): profit -1000.
        assert grid.cells[0][2].profit_agorot == -1000
        # Row 1 = base price; col 0 = base cost: profit 1000, zero-rate NPV equals profit.
        assert grid.cells[1][0].profit_agorot == 1000
        assert grid.cells[1][0].npv_agorot == 1000
