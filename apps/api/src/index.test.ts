import { expect, it } from "vitest";

import { loadConfig } from "./index.js";

it("loadConfig fails fast on an invalid environment", () => {
  expect(() => loadConfig({})).toThrow(/ANALYTICS_URL/);
  expect(() =>
    loadConfig({
      ANALYTICS_URL: "http://127.0.0.1:8001",
      JWT_SECRET: "too-short",
    }),
  ).toThrow(/JWT_SECRET/);
});

it("loadConfig applies defaults and parses numbers", () => {
  const config = loadConfig({
    ANALYTICS_URL: "http://127.0.0.1:8001",
    JWT_SECRET: "test-secret-test-secret-test-secret-42",
    PORT: "4100",
  });
  expect(config.port).toBe(4100);
  expect(config.host).toBe("127.0.0.1");
  expect(config.nodeEnv).toBe("development");
  expect(config.databaseUrl).toBeUndefined();
});
