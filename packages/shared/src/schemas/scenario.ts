import { z } from "zod";

import { AgorotSchema, IsoDateTimeSchema, RateFractionSchema } from "./primitives.js";
import { SimulationResultSchema } from "./simulation.js";

/** One line of the apartment mix (תמהיל דירות) in a scenario. */
export const ApartmentMixEntrySchema = z.object({
  label: z.string().min(1).max(100),
  units: z.number().int().positive(),
  /** Average apartment area for this line, square meters. */
  areaSqm: z.number().positive(),
  salePricePerSqmAgorot: AgorotSchema,
});
export type ApartmentMixEntry = z.infer<typeof ApartmentMixEntrySchema>;

/** One cost line (סעיף עלות); amounts are integer agorot, always. */
export const CostItemSchema = z.object({
  label: z.string().min(1).max(100),
  amountAgorot: AgorotSchema,
});
export type CostItem = z.infer<typeof CostItemSchema>;

export const ScenarioCreateSchema = z.object({
  name: z.string().min(1).max(200),
  apartmentMix: z.array(ApartmentMixEntrySchema).min(1),
  costItems: z.array(CostItemSchema).min(1),
  /** Discount rate as a decimal fraction (0.07 = 7%). */
  discountRate: RateFractionSchema,
});
export type ScenarioCreate = z.infer<typeof ScenarioCreateSchema>;

/**
 * Request body the API sends to the analytics service `POST /v1/simulate` —
 * exactly the scenario's financial inputs.
 */
export const SimulationRequestSchema = ScenarioCreateSchema.pick({
  apartmentMix: true,
  costItems: true,
  discountRate: true,
});
export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

/**
 * A stored scenario. `result` is the last analytics simulation stored against
 * it, or null when it has never been (successfully) simulated.
 */
export const ScenarioSchema = ScenarioCreateSchema.extend({
  id: z.uuid(),
  projectId: z.uuid(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  result: SimulationResultSchema.nullable(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;
