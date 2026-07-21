import { describe, expect, it } from "vitest";

import {
  ApiErrorSchema,
  LoginRequestSchema,
  ProjectCreateSchema,
  RoleSchema,
  ScenarioCreateSchema,
  SimulationResultSchema,
} from "./index.js";

const VALID_SCENARIO = {
  name: "תרחיש בסיס",
  apartmentMix: [{ label: "3 חדרים", units: 40, areaSqm: 85, salePricePerSqmAgorot: 4_500_000 }],
  costItems: [{ label: "עלות בנייה", amountAgorot: 9_000_000_000 }],
  discountRate: 0.07,
};

const VALID_RESULT = {
  irr: "0.1432",
  npvAgorot: 123_456_700,
  profitAgorot: 250_000_000,
  roiOnCost: 0.185,
  paybackYears: 4.2,
  sensitivity: {
    priceDeltas: [-0.1, 0, 0.1],
    costDeltas: [-0.1, 0, 0.1],
    npvAgorot: [
      [100, 200, 300],
      [90, 190, 290],
      [80, 180, 280],
    ],
  },
};

describe("ProjectCreateSchema", () => {
  it("accepts a minimal project (name only)", () => {
    expect(ProjectCreateSchema.parse({ name: "רוטשילד 45" }).name).toBe("רוטשילד 45");
  });

  it("accepts taba-mapped fields with agorot integers", () => {
    const parsed = ProjectCreateSchema.parse({
      name: "רוטשילד 45",
      caseNumber: "2024-001",
      city: "תל אביב",
      existingUnits: 16,
      proposedUnits: 88,
      lotArea: 800,
      buildCostPerSqmAgorot: 2_500_000,
    });
    expect(parsed.buildCostPerSqmAgorot).toBe(2_500_000);
  });

  it("rejects a missing name, negative units and float agorot", () => {
    expect(ProjectCreateSchema.safeParse({}).success).toBe(false);
    expect(ProjectCreateSchema.safeParse({ name: "x", existingUnits: -1 }).success).toBe(false);
    expect(
      ProjectCreateSchema.safeParse({ name: "x", landValueAgorot: 100.5 }).success,
    ).toBe(false);
  });
});

describe("ScenarioCreateSchema", () => {
  it("accepts a valid scenario", () => {
    expect(ScenarioCreateSchema.parse(VALID_SCENARIO).discountRate).toBe(0.07);
  });

  it("rejects percent-point discount rates (7 instead of 0.07)", () => {
    expect(
      ScenarioCreateSchema.safeParse({ ...VALID_SCENARIO, discountRate: 7 }).success,
    ).toBe(false);
  });

  it("rejects float agorot in cost items and empty mixes", () => {
    expect(
      ScenarioCreateSchema.safeParse({
        ...VALID_SCENARIO,
        costItems: [{ label: "בנייה", amountAgorot: 99.99 }],
      }).success,
    ).toBe(false);
    expect(
      ScenarioCreateSchema.safeParse({ ...VALID_SCENARIO, apartmentMix: [] }).success,
    ).toBe(false);
  });
});

describe("SimulationResultSchema", () => {
  it("accepts a full analytics /v1/simulate response", () => {
    expect(SimulationResultSchema.parse(VALID_RESULT).irr).toBe("0.1432");
  });

  it("accepts null irr and null payback (undefined, never fabricated)", () => {
    const parsed = SimulationResultSchema.parse({
      ...VALID_RESULT,
      irr: null,
      paybackYears: null,
    });
    expect(parsed.irr).toBeNull();
    expect(parsed.paybackYears).toBeNull();
  });

  it("rejects numeric irr, malformed irr strings, and float npvAgorot", () => {
    expect(SimulationResultSchema.safeParse({ ...VALID_RESULT, irr: 0.14 }).success).toBe(false);
    expect(SimulationResultSchema.safeParse({ ...VALID_RESULT, irr: "14.3%" }).success).toBe(
      false,
    );
    expect(
      SimulationResultSchema.safeParse({ ...VALID_RESULT, npvAgorot: 1.5 }).success,
    ).toBe(false);
  });
});

describe("auth schemas", () => {
  it("parses a valid login request and rejects bad emails / short passwords", () => {
    expect(
      LoginRequestSchema.parse({ email: "analyst@example.com", password: "s3cret-pass" }).email,
    ).toBe("analyst@example.com");
    expect(LoginRequestSchema.safeParse({ email: "not-an-email", password: "s3cret-pass" }).success).toBe(false);
    expect(LoginRequestSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
  });

  it("only allows the three documented roles", () => {
    expect(RoleSchema.parse("analyst")).toBe("analyst");
    expect(RoleSchema.safeParse("superuser").success).toBe(false);
  });
});

describe("ApiErrorSchema", () => {
  it("matches the single error envelope", () => {
    expect(
      ApiErrorSchema.parse({ error: { code: "NOT_FOUND", message: "missing" } }).error.code,
    ).toBe("NOT_FOUND");
    expect(ApiErrorSchema.safeParse({ code: "NOT_FOUND" }).success).toBe(false);
  });
});
