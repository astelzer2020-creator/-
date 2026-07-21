/**
 * Money display helpers. Amounts are integer agorot everywhere (docs/CODING_STANDARDS.md
 * rule 3); floats appear only at the display/input boundary, never in accounting arithmetic.
 */

const wholeShekelFormat = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const percentFormat = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

const decimalFormat = new Intl.NumberFormat("he-IL", {
  maximumFractionDigits: 0,
});

/**
 * Rounds integer agorot to whole shekels using only integer arithmetic
 * (half-away-from-zero), avoiding float division on monetary values.
 */
export function agorotToWholeShekels(agorot: number): number {
  if (!Number.isSafeInteger(agorot)) {
    throw new RangeError(
      `agorot must be a safe integer, got ${String(agorot)}`,
    );
  }
  const sign = agorot < 0 ? -1 : 1;
  const abs = Math.abs(agorot);
  const shekels = Math.trunc(abs / 100);
  const remainder = abs % 100;
  return sign * (remainder >= 50 ? shekels + 1 : shekels);
}

/** Formats integer agorot as whole-shekel he-IL currency (bank-report convention). */
export function formatAgorot(agorot: number): string {
  return wholeShekelFormat.format(agorotToWholeShekels(agorot));
}

/** Formats a decimal fraction (0.0715) as a he-IL percentage ("7.2%"). */
export function formatFraction(fraction: number): string {
  return percentFormat.format(fraction);
}

/**
 * Formats a decimal-fraction string off the wire ("0.1423" → "14.2%").
 * Returns null when the input is not parseable — callers render an explicit
 * "undefined" state instead of a fabricated number.
 */
export function formatFractionString(fraction: string): string | null {
  const parsed = Number(fraction);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return percentFormat.format(parsed);
}

/** Formats a plain count (units, months) with he-IL grouping. */
export function formatNumber(value: number): string {
  return decimalFormat.format(value);
}

/**
 * Parses a user-typed shekel amount ("1,250,000" / "₪ 1250000.50") into integer agorot.
 * Returns null when not parseable. The single float multiply is confined to this input
 * boundary and immediately rounded to an integer.
 */
export function parseShekelInput(raw: string): number | null {
  const cleaned = raw.replace(/[₪,\s‏‎]/g, "");
  if (cleaned === "" || !/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const agorot = Math.round(Number(cleaned) * 100);
  return Number.isSafeInteger(agorot) ? agorot : null;
}

/**
 * Parses a user-typed percentage ("7" / "7.5") into a decimal fraction (0.075).
 * Percent values are decimal fractions internally — never 7 (CODING_STANDARDS rule 3).
 */
export function parsePercentInput(raw: string): number | null {
  const cleaned = raw.replace(/[%\s]/g, "");
  if (cleaned === "" || !/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  return Number(cleaned) / 100;
}

/** Parses a plain integer input ("12"). Returns null when not a non-negative integer. */
export function parseIntegerInput(raw: string): number | null {
  const cleaned = raw.trim();
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return Number.isSafeInteger(value) ? value : null;
}

/** Parses a positive decimal input ("82.5") for non-monetary quantities (area). */
export function parseDecimalInput(raw: string): number | null {
  const cleaned = raw.trim();
  if (cleaned === "" || !/^\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
