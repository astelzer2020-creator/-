import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/validation";

const validLead = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "(212) 555-0100",
  projectType: "Residential renovation",
  projectLocation: "Brooklyn",
  message: "Planning a full renovation of a prewar apartment.",
};

describe("leadSchema", () => {
  it("accepts a valid lead", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("accepts optional fields when provided", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      desiredStart: "1-3 months",
      referralSource: "Referral from architect",
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ["name", "A", "too short"],
    ["email", "not-an-email", "invalid format"],
    ["phone", "abc", "non-phone characters"],
    ["projectType", "Nonsense", "outside enum"],
    ["projectLocation", "x", "too short"],
    ["message", "short", "below minimum length"],
  ])("rejects invalid %s (%s — %s)", (field, value) => {
    const result = leadSchema.safeParse({ ...validLead, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === field)).toBe(true);
    }
  });

  it("rejects a filled honeypot", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      company_website: "https://spam.example",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace before validating", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      name: "  Jane Doe  ",
      email: " jane@example.com ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Jane Doe");
  });

  it("caps message length at 4000 characters", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      message: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});
