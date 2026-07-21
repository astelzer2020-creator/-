import { expect, it } from "vitest";

import { formatILS, fromShekel, he, mapTabaHeader, ScenarioCreateSchema } from "./index.js";

it("re-exports the taba mapping, money helpers, schemas and i18n from the barrel", () => {
  expect(mapTabaHeader("מספר תיק")).toBe("caseNumber");
  expect(formatILS(fromShekel(1))).toContain("₪");
  expect(typeof ScenarioCreateSchema.safeParse).toBe("function");
  expect(he["nav.projects"].length).toBeGreaterThan(0);
});
