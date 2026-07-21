import { describe, expect, it } from "vitest";

import { asAgorot, asRateFraction, formatILS, fromShekel, toShekel } from "./money.js";

/** Intl inserts RTL/LTR marks and NBSPs; strip them for content assertions. */
function visible(formatted: string): string {
  return formatted.replace(/[\u200E\u200F\u061C\u00A0\u202A-\u202E]/g, " ").trim();
}

describe("asAgorot", () => {
  it("accepts safe integers", () => {
    expect(asAgorot(0)).toBe(0);
    expect(asAgorot(-123)).toBe(-123);
    expect(asAgorot(4_500_000)).toBe(4_500_000);
  });

  it("rejects floats, NaN and unsafe integers — money never travels as a float", () => {
    expect(() => asAgorot(1.5)).toThrow(RangeError);
    expect(() => asAgorot(Number.NaN)).toThrow(RangeError);
    expect(() => asAgorot(2 ** 53)).toThrow(RangeError);
  });
});

describe("fromShekel / toShekel", () => {
  it("converts shekels to integer agorot, rounding to the nearest agora", () => {
    expect(fromShekel(1234.56)).toBe(123_456);
    expect(fromShekel(0.005)).toBe(1);
    expect(fromShekel(-10)).toBe(-1_000);
  });

  it("rejects non-finite shekel amounts", () => {
    expect(() => fromShekel(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("round-trips whole agorot", () => {
    expect(toShekel(asAgorot(123_456))).toBe(1234.56);
  });
});

describe("formatILS", () => {
  it("formats agorot as he-IL ILS currency", () => {
    const formatted = visible(formatILS(asAgorot(123_456)));
    expect(formatted).toContain("₪");
    expect(formatted).toContain("1,234.56");
  });

  it("keeps the sign for negative amounts", () => {
    expect(visible(formatILS(asAgorot(-50_000)))).toContain("500");
    expect(formatILS(asAgorot(-50_000))).toContain("-");
  });
});

describe("asRateFraction", () => {
  it("accepts decimal fractions in [0, 1]", () => {
    expect(asRateFraction(0)).toBe(0);
    expect(asRateFraction(0.07)).toBe(0.07);
    expect(asRateFraction(1)).toBe(1);
  });

  it("rejects percent points (the 7-instead-of-0.07 mistake)", () => {
    expect(() => asRateFraction(7)).toThrow(RangeError);
    expect(() => asRateFraction(-0.01)).toThrow(RangeError);
    expect(() => asRateFraction(Number.NaN)).toThrow(RangeError);
  });
});
