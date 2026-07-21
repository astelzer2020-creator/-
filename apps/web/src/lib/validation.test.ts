import { describe, expect, it } from "vitest";

import { t } from "../i18n";
import type { ScenarioFormValues } from "./validation";
import { issuesToFieldErrors, loginSchema, scenarioSchema } from "./validation";

function validScenario(): ScenarioFormValues {
  return {
    name: "תרחיש בסיס",
    apartmentMix: [
      { rooms: 3, count: 40, areaSqm: 78, salePricePerUnitAgorot: 240_000_000 },
      {
        rooms: 4,
        count: 36,
        areaSqm: 102,
        salePricePerUnitAgorot: 310_000_000,
      },
    ],
    buildCostPerSqmAgorot: 980_000,
    otherCostsAgorot: 0,
    discountRate: 0.07,
    constructionMonths: 36,
  };
}

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.co.il", password: "12345678" })
        .success,
    ).toBe(true);
  });

  it("rejects a malformed email with the Hebrew i18n message", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issuesToFieldErrors(result.error).email).toBe(
        t("auth.errors.emailInvalid"),
      );
    }
  });

  it("rejects a short password with the Hebrew i18n message", () => {
    const result = loginSchema.safeParse({
      email: "a@b.co.il",
      password: "1234",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issuesToFieldErrors(result.error).password).toBe(
        t("auth.errors.passwordMin"),
      );
    }
  });
});

describe("scenarioSchema", () => {
  it("accepts a valid scenario", () => {
    expect(scenarioSchema.safeParse(validScenario()).success).toBe(true);
  });

  it("rejects negative money and out-of-range rates with field-level Hebrew messages", () => {
    const invalid = {
      ...validScenario(),
      buildCostPerSqmAgorot: -5,
      discountRate: 0.9,
    };
    const result = scenarioSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = issuesToFieldErrors(result.error);
      expect(errors.buildCostPerSqmAgorot).toBe(
        t("scenario.errors.buildCostPositive"),
      );
      expect(errors.discountRate).toBe(t("scenario.errors.discountRateRange"));
    }
  });

  it("requires at least one apartment-mix row", () => {
    const result = scenarioSchema.safeParse({
      ...validScenario(),
      apartmentMix: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issuesToFieldErrors(result.error).apartmentMix).toBe(
        t("scenario.errors.mixRequired"),
      );
    }
  });

  it("cross-field: rejects two mix rows with the same room count", () => {
    const scenario = validScenario();
    const firstRow = scenario.apartmentMix[0];
    if (!firstRow) {
      throw new Error("fixture must have a mix row");
    }
    scenario.apartmentMix.push({ ...firstRow });
    const result = scenarioSchema.safeParse(scenario);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = issuesToFieldErrors(result.error);
      expect(errors["apartmentMix.2.rooms"]).toBe(
        t("scenario.errors.duplicateRooms"),
      );
    }
  });

  it("marks NaN (unparseable input) as an invalid number in Hebrew", () => {
    const result = scenarioSchema.safeParse({
      ...validScenario(),
      constructionMonths: Number.NaN,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issuesToFieldErrors(result.error).constructionMonths).toBe(
        t("scenario.errors.numberInvalid"),
      );
    }
  });
});
