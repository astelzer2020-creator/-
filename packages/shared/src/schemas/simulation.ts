import { z } from "zod";

import { AgorotSchema } from "./primitives.js";

/**
 * Sensitivity grid: NPV (integer agorot) for each (cost delta, price delta)
 * pair. Deltas are decimal fractions (e.g. -0.1 = prices 10% lower).
 * `npvAgorot[i][j]` corresponds to `costDeltas[i]` × `priceDeltas[j]`.
 */
export const SensitivityGridSchema = z.object({
  priceDeltas: z.array(z.number()).min(1),
  costDeltas: z.array(z.number()).min(1),
  npvAgorot: z.array(z.array(AgorotSchema).min(1)).min(1),
});
export type SensitivityGrid = z.infer<typeof SensitivityGridSchema>;

/**
 * Response of the analytics service `POST /v1/simulate`, stored verbatim on
 * the scenario. IRR travels as a decimal-fraction STRING (or null when no
 * IRR exists, e.g. all-negative cashflows) so precision is never eaten by
 * JSON float round-tripping; a missing IRR is surfaced as null, never a
 * fabricated number.
 */
export const SimulationResultSchema = z.object({
  irr: z
    .string()
    .regex(
      /^-?\d+(\.\d+)?$/,
      'irr must be a decimal-fraction string, e.g. "0.1432"',
    )
    .nullable(),
  npvAgorot: AgorotSchema,
  profitAgorot: AgorotSchema,
  /** Profit over total cost, as a decimal fraction. */
  roiOnCost: z.number(),
  /** Years until cumulative cashflow turns positive; null if never. */
  paybackYears: z.number().nonnegative().nullable(),
  sensitivity: SensitivityGridSchema,
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
