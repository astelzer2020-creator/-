import { z } from "zod";

import { AgorotSchema, IsoDateTimeSchema } from "./primitives.js";

/**
 * Project creation input. Field names follow the taba glossary
 * (`TABA_COLUMN_MAP` in `../taba.ts`); everything beyond `name` is optional
 * because imported files vary in which columns they carry.
 */
export const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  caseNumber: z.string().min(1).max(50).optional(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  neighborhood: z.string().min(1).max(100).optional(),
  block: z.string().min(1).max(20).optional(),
  parcel: z.string().min(1).max(20).optional(),
  buildingType: z.string().min(1).max(100).optional(),
  planType: z.string().min(1).max(100).optional(),
  status: z.string().min(1).max(100).optional(),
  buildYear: z.number().int().min(1800).max(2200).optional(),
  existingFloors: z.number().int().nonnegative().optional(),
  proposedFloors: z.number().int().nonnegative().optional(),
  existingUnits: z.number().int().nonnegative().optional(),
  proposedUnits: z.number().int().nonnegative().optional(),
  /** Lot area in square meters. */
  lotArea: z.number().positive().optional(),
  landValueAgorot: AgorotSchema.optional(),
  buildCostPerSqmAgorot: AgorotSchema.optional(),
  salePricePerSqmAgorot: AgorotSchema.optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

export const ProjectUpdateSchema = ProjectCreateSchema.partial();
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export const ProjectSchema = ProjectCreateSchema.extend({
  id: z.uuid(),
  orgId: z.uuid(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});
export type Project = z.infer<typeof ProjectSchema>;
