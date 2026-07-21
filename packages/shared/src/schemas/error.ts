import { z } from "zod";

/**
 * The single API error envelope (docs/CODING_STANDARDS.md rule 4):
 * `{ error: { code, message, details? } }` — every non-2xx API response has
 * exactly this shape.
 */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
