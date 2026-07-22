"""Pydantic v2 request/response models for POST /v1/simulate.

CONTRACT AUTHORITY: ``packages/shared/src/schemas/scenario.ts`` (SimulationRequestSchema)
and ``packages/shared/src/schemas/simulation.ts`` (SimulationResultSchema) are the single
source of truth for this wire shape (docs/ARCHITECTURE.md "Shared contracts"). Field names
are camelCase on the wire — pydantic aliases map them to snake_case internally.

Wire conventions (docs/CODING_STANDARDS.md #3):
- monetary amounts: integer agorot (JSON integers);
- ``irr`` travels as a decimal-fraction STRING (or null) so solver precision never rides a
  binary float; ``roiOnCost``/``paybackYears``/deltas are JSON numbers per the shared
  schema — they are display-grade ratios, not money, and are converted from Decimal once
  at this boundary;
- validation at the boundary: these models are the only place request JSON is trusted from.

V1 TIMELINE CONVENTION (periods ARE years):
    The shared request carries NO phasing or horizon — only the apartment mix, cost lines
    and an annual discount rate. It maps onto the engine's period model as a single-year
    deal: every cost lands at period 0 ("today"), all sale revenue lands at period 1 (one
    year out). One engine period therefore IS one calendar year: ``discountRate`` is used
    as the per-period rate unchanged, and the engine's ``payback_periods`` is returned
    verbatim as ``paybackYears``. All cost items are mapped to ``CostCategory.CONSTRUCTION``
    so the sensitivity grid's cost axis scales the full cost base. Multi-year phasing is an
    M2 contract extension (new ADR), not a silent reinterpretation of this one.

Revenue derivation (documented, deterministic):
    ``totalRevenueAgorot = Σ_line to_agorot(units x areaSqm x salePricePerSqmAgorot)`` —
    each mix line is computed in Decimal (``areaSqm`` via ``Decimal(str(...))`` to take the
    shortest float repr) and rounded half-even to whole agorot ONCE per line, then summed
    exactly.
"""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from atlas_analytics.engine.cashflow import CostCategory, CostItem, Phasing, Scenario
from atlas_analytics.engine.rounding import to_agorot


def parse_decimal(value: str) -> Decimal:
    """Parse a decimal string into a finite Decimal; raise ValueError otherwise."""
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"not a decimal string: {value!r}") from exc
    if not parsed.is_finite():
        raise ValueError(f"decimal string must be finite: {value!r}")
    return parsed


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


class _WireModel(BaseModel):
    """Base for all wire models: camelCase aliases, unknown fields rejected."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class ApartmentMixEntryIn(_WireModel):
    """One apartment-mix line — mirrors shared ``ApartmentMixEntrySchema``.

    ``salePricePerSqmAgorot`` is constrained non-negative here (engine domain rule: revenue
    cannot be negative); shared's AgorotSchema is a plain safe integer.
    """

    label: str = Field(min_length=1, max_length=100)
    units: int = Field(gt=0)
    area_sqm: float = Field(gt=0, allow_inf_nan=False)
    sale_price_per_sqm_agorot: int = Field(ge=0)

    def revenue_agorot(self) -> int:
        """Line revenue in integer agorot, rounded half-even exactly once (module docstring)."""
        exact = Decimal(self.units) * Decimal(str(self.area_sqm)) * self.sale_price_per_sqm_agorot
        return to_agorot(exact)


class CostItemIn(_WireModel):
    """One cost line — mirrors shared ``CostItemSchema`` (label + integer agorot)."""

    label: str = Field(min_length=1, max_length=100)
    amount_agorot: int = Field(ge=0)


class SimulateRequest(_WireModel):
    """Mirror of shared ``SimulationRequestSchema`` — exactly the scenario's financial inputs."""

    apartment_mix: list[ApartmentMixEntryIn] = Field(min_length=1)
    cost_items: list[CostItemIn] = Field(min_length=1)
    discount_rate: float = Field(ge=0, le=1, allow_inf_nan=False)

    def discount_rate_decimal(self) -> Decimal:
        """Annual rate as Decimal via the float's shortest repr (0.07 → Decimal('0.07'))."""
        return Decimal(str(self.discount_rate))

    def to_engine(self) -> Scenario:
        """Map onto the engine scenario under the v1 single-year convention (module docstring)."""
        return Scenario(
            num_periods=1,
            total_revenue_agorot=sum(line.revenue_agorot() for line in self.apartment_mix),
            revenue_phasing=Phasing(start_period=1, end_period=1),
            cost_items=tuple(
                CostItem(
                    name=item.label,
                    category=CostCategory.CONSTRUCTION,
                    amount_agorot=item.amount_agorot,
                    phasing=Phasing(start_period=0, end_period=0),
                )
                for item in self.cost_items
            ),
        )


class SensitivityGridOut(_WireModel):
    """Mirror of shared ``SensitivityGridSchema``.

    ``npv_agorot[i][j]`` corresponds to ``cost_deltas[i]`` x ``price_deltas[j]`` (cost rows,
    price columns — the shared orientation; the engine grid is transposed at serialization).
    """

    price_deltas: list[float] = Field(min_length=1)
    cost_deltas: list[float] = Field(min_length=1)
    npv_agorot: list[list[int]] = Field(min_length=1)


class SimulateResponse(_WireModel):
    """Mirror of shared ``SimulationResultSchema`` — camelCase on the wire.

    ``irr`` is a decimal-fraction string or null (never a fabricated number);
    ``payback_years`` is the engine's fractional payback in periods, which ARE years under
    the v1 convention; ``roi_on_cost`` is null when total cost is zero (ratio undefined).
    """

    irr: str | None
    npv_agorot: int
    profit_agorot: int
    roi_on_cost: float | None
    payback_years: float | None
    sensitivity: SensitivityGridOut


class HealthResponse(BaseModel):
    status: str
