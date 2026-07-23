import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    /**
     * Non-demo dev/preview: the client's default base URL is "/api" (same
     * origin — the API serves no CORS headers by design, docs/SECURITY.md).
     * The dev server forwards /api/* to a locally running apps/api instance;
     * override the target with ATLAS_API_PROXY_TARGET when the API is not on
     * its default port. Production fronts both behind one origin (infra).
     */
    proxy: {
      "/api": {
        target: process.env.ATLAS_API_PROXY_TARGET ?? "http://127.0.0.1:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
  },
});
