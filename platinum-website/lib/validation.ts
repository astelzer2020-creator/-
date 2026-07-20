import { z } from "zod";

export const projectTypes = [
  "Residential renovation",
  "Commercial build-out",
  "Specialty installation",
  "General contracting",
  "Other / not sure yet",
] as const;

export const desiredStartOptions = [
  "As soon as practical",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Exploring",
] as const;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(200, "Email is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number we can reach you at.")
    .max(30, "Phone number is too long.")
    .regex(/^[+()\-.\s\d]+$/, "Please enter a valid phone number."),
  projectType: z.enum(projectTypes, {
    errorMap: () => ({ message: "Select the closest fit." }),
  }),
  projectLocation: z
    .string()
    .trim()
    .min(2, "Neighborhood / city is enough for now.")
    .max(160, "Location is too long."),
  desiredStart: z.enum(desiredStartOptions).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Tell us briefly what you are building.")
    .max(4000, "Message is too long — please keep it under 4000 characters."),
  referralSource: z.string().trim().max(200).optional(),
  /** Honeypot — must stay empty. Bots fill it; humans never see it. */
  company_website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadFieldErrors = Partial<Record<keyof LeadInput, string>>;

export interface LeadFormState {
  status: "idle" | "success" | "error";
  fieldErrors?: LeadFieldErrors;
  formError?: string;
  /** Echo of submitted values so the form can repopulate after a
   *  server-side validation error (React 19 resets uncontrolled forms). */
  values?: Partial<Record<keyof LeadInput, string>>;
}
