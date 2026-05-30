import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Default environment is `node` (for lib + route-handler tests).
// Component tests opt into jsdom with a per-file docblock:
//   // @vitest-environment jsdom
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      // Mirror tsconfig.json "@/*" -> repo root
      "@": path.resolve(__dirname, "."),
    },
  },
});
