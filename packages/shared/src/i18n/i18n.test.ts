import { describe, expect, it } from "vitest";

import { en } from "./en.js";
import { he } from "./he.js";

describe("i18n resources", () => {
  it("mirrors keys exactly between he and en", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(he).sort());
  });

  it("has non-empty values everywhere", () => {
    for (const value of [...Object.values(he), ...Object.values(en)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it("has Hebrew content in he and none in en", () => {
    const hebrew = /[\u0590-\u05FF]/;
    expect(hebrew.test(he["projects.empty"])).toBe(true);
    for (const value of Object.values(en)) {
      expect(hebrew.test(value)).toBe(false);
    }
  });
});
