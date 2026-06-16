import { test, expect } from "@playwright/test";

test("la page d'accueil affiche le placeholder Kitoo", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Kitoo — application/ }),
  ).toBeVisible();
  await expect(page.getByText("en construction")).toBeVisible();
});
