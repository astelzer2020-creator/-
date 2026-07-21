/**
 * Money in Atlas is integer agorot (1/100 ₪) in storage and transport
 * (docs/CODING_STANDARDS.md rule 3). Floats are allowed only inside numeric
 * algorithms (e.g. IRR root finding), never for accounting arithmetic.
 * Percent-like values are decimal fractions (0.07), never percent points (7).
 */

declare const agorotBrand: unique symbol;

/** A monetary amount in integer agorot (1/100 ₪). */
export type Agorot = number & { readonly [agorotBrand]: true };

/** A rate as a decimal fraction per the standard (0.07 = 7%). */
export type RateFraction = number;

/**
 * Asserts that `value` is a valid agorot amount (safe integer) and brands it.
 * Throws `RangeError` otherwise — money never travels as a float.
 */
export function asAgorot(value: number): Agorot {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`agorot amounts must be safe integers, got ${String(value)}`);
  }
  return value as Agorot;
}

/**
 * Converts a shekel amount to integer agorot, rounding to the nearest agora.
 * Boundary conversion only (user input, display) — internal arithmetic stays
 * in integer agorot.
 */
export function fromShekel(shekels: number): Agorot {
  if (!Number.isFinite(shekels)) {
    throw new RangeError(`shekel amount must be finite, got ${String(shekels)}`);
  }
  return asAgorot(Math.round(shekels * 100));
}

/** Converts integer agorot to a shekel number. For display/algorithms only. */
export function toShekel(amount: Agorot): number {
  return amount / 100;
}

/**
 * Formats integer agorot as a Hebrew-locale ILS currency string (e.g. for
 * "₪1,234.56"-style display). Display only — never parse this back.
 */
export function formatILS(amount: Agorot): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount / 100);
}

/**
 * Asserts that `value` is a decimal-fraction rate in [0, 1] and returns it.
 * Guards against the classic percent-points mistake (7 instead of 0.07).
 */
export function asRateFraction(value: number): RateFraction {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(
      `rates are decimal fractions in [0, 1] (0.07, never 7), got ${String(value)}`,
    );
  }
  return value;
}
