import { expect, it } from "vitest";

import { workspaceName } from "./index.js";

it("reports its workspace name", () => {
  expect(workspaceName()).toBe("@atlas/api");
});
