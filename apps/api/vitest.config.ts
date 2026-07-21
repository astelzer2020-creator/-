import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Tests run against @atlas/shared source so no prior build is needed
      // (package "exports" points runtime consumers at dist/).
      "@atlas/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
});
