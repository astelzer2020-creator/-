import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { mapTabaHeader, normalizeTabaHeader, TABA_COLUMN_MAP, type TabaField } from "./taba.js";

const SAMPLE_CSV_URL = new URL("../../../data/sample/sample-taba-projects.csv", import.meta.url);

describe("normalizeTabaHeader", () => {
  it("strips a leading BOM and trims/collapses whitespace", () => {
    expect(normalizeTabaHeader("\uFEFF" + "מספר תיק")).toBe("מספר תיק");
    expect(normalizeTabaHeader("  קומות   קיים ")).toBe("קומות קיים");
  });

  it("canonicalizes gershayim and curly quotes to ASCII without stripping them", () => {
    // Regression guard for the legacy mobile bug (ImportScreen.jsx stripped
    // `"` and silently broke the יח"ד columns).
    expect(normalizeTabaHeader("יח״ד קיים")).toBe('יח"ד קיים');
    expect(normalizeTabaHeader("יח“ד קיים")).toBe('יח"ד קיים');
    expect(normalizeTabaHeader('יח"ד קיים')).toContain('"');
  });
});

describe("mapTabaHeader", () => {
  it("maps ASCII-quote and U+05F4-gershayim יח\"ד headers to the same fields", () => {
    expect(mapTabaHeader('יח"ד קיים')).toBe("existingUnits");
    expect(mapTabaHeader("יח״ד קיים")).toBe("existingUnits");
    expect(mapTabaHeader('יח"ד מוצע')).toBe("proposedUnits");
    expect(mapTabaHeader("יח״ד מוצע")).toBe("proposedUnits");
  });

  it("maps both שטח מגרש and the legacy שטח קרקע to lotArea", () => {
    expect(mapTabaHeader("שטח מגרש")).toBe("lotArea");
    expect(mapTabaHeader("שטח קרקע")).toBe("lotArea");
  });

  it("returns null for unknown headers instead of guessing", () => {
    expect(mapTabaHeader("עמודה לא מוכרת")).toBeNull();
    expect(mapTabaHeader("")).toBeNull();
  });

  it("maps every header of the real sample CSV first row (incl. the gershayim headers)", () => {
    const firstLine = readFileSync(SAMPLE_CSV_URL, "utf-8").split("\n")[0];
    expect(firstLine).toBeDefined();
    const headers = (firstLine ?? "").trim().split(",");
    expect(headers).toHaveLength(17);

    const mapped = headers.map((header) => mapTabaHeader(header));
    expect(mapped).toEqual([
      "caseNumber",
      "address",
      "city",
      "block",
      "parcel",
      "buildingType",
      "buildYear",
      "existingFloors",
      "proposedFloors",
      "existingUnits",
      "proposedUnits",
      "lotArea",
      "landValue",
      "buildCostPerSqm",
      "salePricePerSqm",
      "planType",
      "status",
    ] satisfies TabaField[]);
  });

  it("covers the full glossary superset of the three legacy copies", () => {
    const fields = new Set(Object.values(TABA_COLUMN_MAP));
    for (const field of [
      "caseNumber",
      "address",
      "city",
      "neighborhood",
      "block",
      "parcel",
      "buildingType",
      "buildYear",
      "existingFloors",
      "proposedFloors",
      "existingUnits",
      "proposedUnits",
      "lotArea",
      "landValue",
      "buildCostPerSqm",
      "salePricePerSqm",
      "planType",
      "status",
    ]) {
      expect(fields.has(field as TabaField)).toBe(true);
    }
  });
});
