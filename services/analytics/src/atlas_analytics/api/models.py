"""Pydantic v2 request/response models for POST /v1/simulate.

Wire conventions (docs/CODING_STANDARDS.md #3):
- monetary amounts: integer agorot (JSON integers);
- rates / fractions / fractional periods: **decimal strings** (e.g. ``"0.07"``), never JSON
  floats — binary floats must not touch financial values in transport;
- validation at the boundary: these models are the only place request JSON is trusted from.
"""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

from atlas_analytics.engine.cashflow import CostCategory, CostItem, Phasing, Scenario


def parse_decimal(value: str) -> Decimal:
    """Parse a decimal string into a finite Decimal; raise ValueError otherwise."""
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"not a decimal string: {value!r}") from exc
    if not parsed.is_finite():
        raise ValueError(f"decimal string must be finite: {value!r}")
    return parsed


def _validate_decimal_str(value: str) -> str:
    parse_decimal(value)
    return value


DecimalStr = Annotated[str, AfterValidator(_validate_decimal_str)]


def format_decimal(value: Decimal, places: int = 9) -> str:
    """Render a Decimal as a plain decimal string, half-even at ``places`` decimal places.

    Trailing zeros are stripped for readability; ``-0`` normalizes to ``"0"``. 9 places is
    ample: solver tolerance is 1e-4 (docs/TESTING_STRATEGY.md), pure math is compared at 1e-9.
    """
    quantized = value.quantize(Decimal(1).scaleb(-places))
    text = format(quantized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return "0" if text in ("", "-0") else text


class PhasingIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start_period: int = Field(ge=0)
    end_period: int = Field(ge=0)

    def to_engine(self) -> Phasing:
        return Phasing(start_period=self.start_period, end_period=self.end_period)


class CostItemIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    category: CostCategory
    amount_agorot: int = Field(ge=0)
    phasing: PhasingIn

    def to_engine(self) -> CostItem:
        return CostItem(
            name=self.name,
            category=self.category,
            amount_agorot=self.amount_agorot,
            phasing=self.phasing.to_engine(),
        )


class ScenarioIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    num_periods: int = Field(ge=1, le=600)
    total_revenue_agorot: int = Field(ge=0)
    revenue_phasing: PhasingIn
    cost_items: list[CostItemIn] = Field(max_length=100)

    def to_engine(self) -> Scenario:
        """Engine dataclasses re-validate cross-field constraints (phasing vs num_periods)."""
        return Scenario(
            num_periods=self.num_periods,
            total_revenue_agorot=self.total_revenue_agorot,
            revenue_phasing=self.revenue_phasing.to_engine(),
            cost_items=tuple(item.to_engine() for item in self.cost_items),
        )


class SensitivityOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    price_deltas: list[DecimalStr] = Field(
        default=["-0.10", "-0.05", "0", "0.05", "0.10"], max_length=21
    )
    cost_deltas: list[DecimalStr] = Field(
        default=["-0.10", "-0.05", "0", "0.05", "0.10"], max_length=21
    )


class SimulateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario: ScenarioIn
    discount_rate_per_period: DecimalStr
    sensitivity: SensitivityOptions = SensitivityOptions()


class SensitivityCellOut(BaseModel):
    irr: str | None
    npv_agorot: int
    profit_agorot: int


class SensitivityGridOut(BaseModel):
    price_deltas: list[str]
    cost_deltas: list[str]
    cells: list[list[SensitivityCellOut]]


class SimulateResponse(BaseModel):
    irr: str | None
    npv_agorot: int
    profit_agorot: int
    roi_on_cost: str | None
    payback_periods: str | None
    discounted_payback_periods: str | None
    cashflows_agorot: list[int]
    sensitivity: SensitivityGridOut


class HealthResponse(BaseModel):
    status: str
