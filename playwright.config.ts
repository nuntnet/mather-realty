import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 *
 * The base URL defaults to the local dev server. Override with E2E_BASE_URL to
 * point at a deployed/preview environment (in which case the webServer block is
 * skipped via PW_NO_SERVER=1).
 *
 * Prereqs to actually RUN these (not just --list):
 *   bunx playwright install --with-deps chromium
 *   A server with Notion env vars configured (NOTION_API_KEY, *_DB_ID).
 *
 * See docs/TESTING.md for full details.
 */
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
const useExternalServer = !!process.env.E2E_BASE_URL || process.env.PW_NO_SERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          // Use the production server for stable ISR behavior. Switch to
          // "bun run dev" for faster local iteration.
          command: process.env.E2E_USE_DEV ? "bun run dev" : "bun run build && bun run start",
          url: baseURL,
          timeout: 180_000,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
