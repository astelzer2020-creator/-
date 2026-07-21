import { describe, expect, it } from "vitest";

import {
  agorotToWholeShekels,
  formatAgorot,
  formatFraction,
  formatFractionString,
  parseIntegerInput,
  parsePercentInput,
  parseShekelInput,
} from "./money";

// Expected strings are produced by the same Intl locale data the code uses, so the
// tests assert our agorot→shekel logic, not the ICU rendering details of the runtime.
const ils = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

describe("agorotToWholeShekels", () => {
  it("rounds half away from zero using integer arithmetic", () => {
    expect(agorotToWholeShekels(0)).toBe(0);
    expect(agorotToWholeShekels(149)).toBe(1);
    expect(agorotToWholeShekels(150)).toBe(2);
    expect(agorotToWholeShekels(-149)).toBe(-1);
    expect(agorotToWholeShekels(-150)).toBe(-2);
    expect(agorotToWholeShekels(18_000_000_000)).toBe(180_000_000);
  });

  it("rejects non-integer input (money is integer agorot only)", () => {
    expect(() => agorotToWholeShekels(10.5)).toThrow(RangeError);
  });
});

describe("formatAgorot", () => {
  it("formats agorot as he-IL whole-shekel currency", () => {
    expect(formatAgorot(123_456)).toBe(ils.format(1235));
    expect(formatAgorot(18_000_000_000)).toBe(ils.format(180_000_000));
    expect(formatAgorot(-987_654_321)).toBe(ils.format(-9_876_543));
  });

  it("includes the shekel sign", () => {
    expect(formatAgorot(100)).toContain("₪");
  });
});

describe("formatFraction / formatFractionString", () => {
  it("renders decimal fractions as percentages", () => {
    expect(formatFraction(0.07)).toContain("7");
    expect(formatFraction(0.07)).toContain("%");
    expect(formatFractionString("0.1423")).toContain("14.2");
  });

  it("returns null for unparseable wire values instead of fabricating a number", () => {
    expect(formatFractionString("not-a-number")).toBeNull();
  });
});

describe("parseShekelInput", () => {
  it("parses plain and formatted shekel input into integer agorot", () => {
    expect(parseShekelInput("1250000")).toBe(125_000_000);
    expect(parseShekelInput("1,250,000")).toBe(125_000_000);
    expect(parseShekelInput("₪ 99.5")).toBe(9_950);
    expect(parseShekelInput("-42")).toBe(-4_200);
  });

  it("rejects garbage and returns null", () => {
    expect(parseShekelInput("")).toBeNull();
    expect(parseShekelInput("abc")).toBeNull();
    expect(parseShekelInput("1.234")).toBeNull(); // more than 2 decimal digits is ambiguous
  });
});

describe("parsePercentInput / parseIntegerInput", () => {
  it("converts percent input to a decimal fraction (never 7 for 7%)", () => {
    expect(parsePercentInput("7")).toBe(0.07);
    expect(parsePercentInput("7.5%")).toBe(0.075);
    expect(parsePercentInput("")).toBeNull();
  });

  it("parses non-negative integers only", () => {
    expect(parseIntegerInput("36")).toBe(36);
    expect(parseIntegerInput("3.5")).toBeNull();
    expect(parseIntegerInput("-3")).toBeNull();
  });
});
