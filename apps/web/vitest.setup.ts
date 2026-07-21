// Vitest runs without injected globals (explicit imports per test file), so
// @testing-library/react cannot auto-register its afterEach cleanup — do it here.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
