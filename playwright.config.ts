import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 1 retry en local : ces e2e créent des comptes Supabase ; un rate-limit
  // transitoire ne doit pas faire échouer la suite (un vrai bug échoue 2×).
  retries: process.env.CI ? 2 : 1,
  // Concurrence limitée pour ménager les quotas d'inscription Supabase.
  workers: 3,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
