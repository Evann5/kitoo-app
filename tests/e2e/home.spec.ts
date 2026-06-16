import { test, expect } from "@playwright/test";

test("la page d'accueil affiche l'identité Kitoo et mène à l'inscription", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Kitoo" })).toBeVisible();
  await expect(page.getByText(/compagnon bien-être/i)).toBeVisible();

  await page.getByRole("link", { name: "Commencer" }).click();
  await expect(page).toHaveURL(/\/inscription$/);
});
