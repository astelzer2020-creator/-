import { describe, expect, it } from "vitest";
// The REAL shared contract schema (zod 4, dev-dependency): the mapping output
// must parse under it, so any drift between the local wire mirror and
// @atlas/shared fails this suite (QA plan, ATL-023 item 1).
import { ScenarioCreateSchema } from "@atlas/shared";

import type { ScenarioInput } from "./contracts";
import {
  fromProjectWire,
  fromScenarioWire,
  toScenarioCreate,
  type ProjectWire,
  type ScenarioWire,
} from "./api-mapping";

/**
 * HAND-COMPUTED CASE (verified to the agora — QA plan ATL-023 item 1).
 *
 * Form input (integer agorot; ₪ noted for the reader):
 *   mix A: rooms 3, count 40, areaSqm 78,  salePricePerUnit 240,000,000 agorot (₪2,400,000)
 *   mix B: rooms 4, count 36, areaSqm 102, salePricePerUnit 310,000,000 agorot (₪3,100,000)
 *   buildCostPerSqm 980,000 agorot (₪9,800); otherCosts 1,200,000,000 agorot (₪12,000,000)
 *   discountRate 0.07; constructionMonths 36 (dropped — not in the shared contract)
 *
 * Per-unit → per-sqm (round half away from zero on positive values):
 *   A: 240,000,000 / 78  = 3,076,923.0769…  → 3,076,923  (fraction .0769 < .5 → down)
 *   B: 310,000,000 / 102 = 3,039,215.6862…  → 3,039,216  (fraction .6862 ≥ .5 → up)
 *
 * Build-cost total:
 *   total area = 40×78 + 36×102 = 3,120 + 3,672 = 6,792 sqm
 *   build total = 980,000 × 6,792 = 6,656,160,000 agorot (₪66,561,600) — exact, no rounding
 */
const handComputedInput: ScenarioInput = {
  name: "תרחיש בדיקה",
  apartmentMix: [
    { rooms: 3, count: 40, areaSqm: 78, salePricePerUnitAgorot: 240_000_000 },
    { rooms: 4, count: 36, areaSqm: 102, salePricePerUnitAgorot: 310_000_000 },
  ],
  buildCostPerSqmAgorot: 980_000,
  otherCostsAgorot: 1_200_000_000,
  discountRate: 0.07,
  constructionMonths: 36,
};

const handComputedWire = {
  name: "תרחיש בדיקה",
  apartmentMix: [
    {
      label: "3 חדרים",
      units: 40,
      areaSqm: 78,
      salePricePerSqmAgorot: 3_076_923,
    },
    {
      label: "4 חדרים",
      units: 36,
      areaSqm: 102,
      salePricePerSqmAgorot: 3_039_216,
    },
  ],
  costItems: [
    { label: "עלות בנייה", amountAgorot: 6_656_160_000 },
    { label: "עלויות נוספות", amountAgorot: 1_200_000_000 },
  ],
  discountRate: 0.07,
};

describe("toScenarioCreate (form → shared ScenarioCreate)", () => {
  it("maps the hand-computed case exactly, to the agora", () => {
    expect(toScenarioCreate(handComputedInput)).toEqual(handComputedWire);
  });

  it("parses under the REAL @atlas/shared ScenarioCreateSchema with identical values", () => {
    const parsed = ScenarioCreateSchema.parse(
      toScenarioCreate(handComputedInput),
    );
    expect(parsed).toEqual(handComputedWire);
  });

  it("keeps an exactly-divisible per-unit price exact (no rounding side effects)", () => {
    // 1,000,000 / 100 = 10,000 agorot/sqm exactly.
    const out = toScenarioCreate({
      ...handComputedInput,
      apartmentMix: [
        { rooms: 2, count: 1, areaSqm: 100, salePricePerUnitAgorot: 1_000_000 },
      ],
    });
    expect(out.apartmentMix[0]?.salePricePerSqmAgorot).toBe(10_000);
  });

  it("rounds an exact half agora up (Math.round half toward +∞ on positive amounts)", () => {
    // 5 / 2 = 2.5 → 3.
    const out = toScenarioCreate({
      ...handComputedInput,
      apartmentMix: [
        { rooms: 2, count: 1, areaSqm: 2, salePricePerUnitAgorot: 5 },
      ],
    });
    expect(out.apartmentMix[0]?.salePricePerSqmAgorot).toBe(3);
  });

  it("rounds the build-cost total once when areas are fractional", () => {
    // total area = 3 × 80.5 = 241.5 sqm; 241.5 × 999 = 241,258.5 → 241,259 (single round).
    const out = toScenarioCreate({
      ...handComputedInput,
      apartmentMix: [
        {
          rooms: 3,
          count: 3,
          areaSqm: 80.5,
          salePricePerUnitAgorot: 100_000_000,
        },
      ],
      buildCostPerSqmAgorot: 999,
      otherCostsAgorot: 0,
    });
    expect(out.costItems[0]?.amountAgorot).toBe(241_259);
    // otherCosts of 0 is still sent — it mirrors what the user entered.
    expect(out.costItems[1]).toEqual({
      label: "עלויות נוספות",
      amountAgorot: 0,
    });
  });

  it("refuses to emit a precision-lossy amount (unsafe integer) instead of corrupting money", () => {
    expect(() =>
      toScenarioCreate({
        ...handComputedInput,
        // 9e15 × 6,792 sqm overflows Number.MAX_SAFE_INTEGER by far.
        buildCostPerSqmAgorot: 9_000_000_000_000_000,
      }),
    ).toThrow(RangeError);
  });

  it("drops constructionMonths (not part of the shared contract)", () => {
    expect(toScenarioCreate(handComputedInput)).not.toHaveProperty(
      "constructionMonths",
    );
  });
});

describe("fromScenarioWire (shared Scenario → web view-model)", () => {
  const wire: ScenarioWire = {
    ...handComputedWire,
    id: "6b1f2a34-0000-4000-8000-000000000001",
    projectId: "6b1f2a34-0000-4000-8000-000000000002",
    createdAt: "2026-07-23T00:00:00.000Z",
    updatedAt: "2026-07-23T00:00:00.000Z",
    result: null,
  };

  it("inverts the mapping for display (rooms from label, per-unit price, costs)", () => {
    const scenario = fromScenarioWire(wire);
    expect(scenario.name).toBe("תרחיש בדיקה");
    expect(scenario.apartmentMix.map((row) => row.rooms)).toEqual([3, 4]);
    expect(scenario.apartmentMix.map((row) => row.count)).toEqual([40, 36]);
    // 3,076,923 × 78 = 239,999,994 — the disclosed per-sqm conversion residue
    // (6 agorot below the original per-unit price), NOT silent drift.
    expect(scenario.apartmentMix[0]?.salePricePerUnitAgorot).toBe(239_999_994);
    // 6,656,160,000 / 6,792 = 980,000 exactly.
    expect(scenario.buildCostPerSqmAgorot).toBe(980_000);
    expect(scenario.otherCostsAgorot).toBe(1_200_000_000);
    expect(scenario.discountRate).toBe(0.07);
  });

  it("parses rooms as 0 for a label without a leading number (foreign data)", () => {
    const scenario = fromScenarioWire({
      ...wire,
      apartmentMix: [
        {
          label: "פנטהאוז",
          units: 2,
          areaSqm: 200,
          salePricePerSqmAgorot: 5_000_000,
        },
      ],
    });
    expect(scenario.apartmentMix[0]?.rooms).toBe(0);
  });
});

describe("fromProjectWire (shared Project → web view-model)", () => {
  const base: ProjectWire = {
    id: "6b1f2a34-0000-4000-8000-000000000003",
    orgId: "6b1f2a34-0000-4000-8000-000000000004",
    name: "רח' רוטשילד 45",
    createdAt: "2026-07-23T00:00:00.000Z",
    updatedAt: "2026-07-23T00:00:00.000Z",
  };

  it("defaults absent optional fields for display (empty strings, zero counts)", () => {
    expect(fromProjectWire(base)).toEqual({
      id: base.id,
      name: "רח' רוטשילד 45",
      caseNumber: "",
      city: "",
      planType: "",
      status: "planning",
      existingUnits: 0,
      proposedUnits: 0,
      landValueAgorot: 0,
    });
  });

  it("keeps a recognized status and falls back to planning for free-text statuses", () => {
    expect(fromProjectWire({ ...base, status: "inProgress" }).status).toBe(
      "inProgress",
    );
    expect(fromProjectWire({ ...base, status: "בהפקדה" }).status).toBe(
      "planning",
    );
  });
});
