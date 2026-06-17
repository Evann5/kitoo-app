import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Unit/component tests live under src/ and tests/unit; Playwright owns tests/e2e.
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Couverture mesurée sur la LOGIQUE MÉTIER pure (calculs, règles,
      // validation) — c'est là que la couverture est significative. Les
      // composants UI sont couverts par les tests RTL + e2e.
      include: [
        "src/lib/validation.ts",
        "src/lib/moods.ts",
        "src/features/dashboard/stats.ts",
        "src/features/dashboard/home.ts",
        "src/lib/daily-inspiration.ts",
        "src/features/mood/mood-config.ts",
        "src/features/wellbeing/filters.ts",
        "src/features/journal/aggregate.ts",
        "src/features/accessibility/prefs.ts",
        "src/features/auth/index.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
