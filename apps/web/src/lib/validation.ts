import { z } from "zod";

import { t } from "../i18n";

/**
 * Form schemas — validate at the boundary (docs/CODING_STANDARDS.md rule 1).
 * All messages are Hebrew via i18n keys; forms parse raw input into typed,
 * unit-correct values (agorot, decimal fractions) BEFORE these schemas run.
 */

export const loginSchema = z.object({
  email: z.string().email(t("auth.errors.emailInvalid")),
  password: z.string().min(8, t("auth.errors.passwordMin")),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const newProjectSchema = z.object({
  name: z.string().trim().min(1, t("projects.form.errors.nameRequired")),
  city: z.string().trim().min(1, t("projects.form.errors.cityRequired")),
  caseNumber: z
    .string()
    .trim()
    .min(1, t("projects.form.errors.caseNumberRequired")),
});

const apartmentMixRowSchema = z.object({
  rooms: z
    .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
    .int(t("scenario.errors.roomsRange"))
    .min(1, t("scenario.errors.roomsRange"))
    .max(10, t("scenario.errors.roomsRange")),
  count: z
    .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
    .int(t("scenario.errors.countPositive"))
    .min(1, t("scenario.errors.countPositive")),
  areaSqm: z
    .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
    .positive(t("scenario.errors.areaPositive")),
  salePricePerUnitAgorot: z
    .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
    .int(t("scenario.errors.pricePositive"))
    .positive(t("scenario.errors.pricePositive")),
});

export const scenarioSchema = z
  .object({
    name: z.string().trim().min(1, t("scenario.errors.nameRequired")),
    apartmentMix: z
      .array(apartmentMixRowSchema)
      .min(1, t("scenario.errors.mixRequired")),
    buildCostPerSqmAgorot: z
      .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
      .int(t("scenario.errors.buildCostPositive"))
      .positive(t("scenario.errors.buildCostPositive")),
    otherCostsAgorot: z
      .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
      .int(t("scenario.errors.otherCostsNonNegative"))
      .min(0, t("scenario.errors.otherCostsNonNegative")),
    discountRate: z
      .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
      .gt(0, t("scenario.errors.discountRateRange"))
      .lte(0.5, t("scenario.errors.discountRateRange")),
    constructionMonths: z
      .number({ invalid_type_error: t("scenario.errors.numberInvalid") })
      .int(t("scenario.errors.monthsRange"))
      .min(1, t("scenario.errors.monthsRange"))
      .max(120, t("scenario.errors.monthsRange")),
  })
  // Cross-field rule: two mix rows for the same room count must be merged —
  // duplicates silently double-count units in every downstream figure.
  .superRefine((scenario, ctx) => {
    const seen = new Set<number>();
    scenario.apartmentMix.forEach((row, index) => {
      if (seen.has(row.rooms)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("scenario.errors.duplicateRooms"),
          path: ["apartmentMix", index, "rooms"],
        });
      }
      seen.add(row.rooms);
    });
  });

export type ScenarioFormValues = z.infer<typeof scenarioSchema>;

/** Flattens Zod issues to a `path → first message` map for field-level display. */
export function issuesToFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] ??= issue.message;
  }
  return fieldErrors;
}
