import { z } from "zod";

import type { Agorot } from "../money.js";

/** Integer agorot at the API boundary — rejects floats and unsafe integers. */
export const AgorotSchema = z
  .number()
  .int()
  .refine((value) => Number.isSafeInteger(value), {
    message: "agorot amounts must be safe integers",
  })
  .transform((value) => value as Agorot);

/** A rate as a decimal fraction in [0, 1] (0.07 = 7%, never 7). */
export const RateFractionSchema = z
  .number()
  .min(0, "rates are decimal fractions in [0, 1] (0.07, never 7)")
  .max(1, "rates are decimal fractions in [0, 1] (0.07, never 7)");

/** ISO-8601 timestamp string (UTC) used on all API resources. */
export const IsoDateTimeSchema = z.iso.datetime();
