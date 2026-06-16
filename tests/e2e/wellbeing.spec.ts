import { test, expect } from "@playwright/test";

/** Catalogue bien-être → filtre par thème → lecture interne d'une ressource. */
test("catalogue → filtre → lecture d'une ressource", async ({ page }) => {
  const email = `evanelbaz.2005+e2e-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });

  // Catalogue.
  await page.goto("/bien-etre");
  await expect(
    page.getByRole("heading", { name: "Espace bien-être" }),
  ).toBeVisible();

  // Filtre par thème (Stress).
  await page.getByRole("button", { name: "Stress" }).click();
  const card = page.getByRole("link", { name: /Respirer en carré/ });
  await expect(card).toBeVisible();

  // Lecture interne.
  await card.click();
  await expect(page).toHaveURL(/\/bien-etre\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Respirer en carré" }),
  ).toBeVisible();
  await expect(page.getByText(/validé par des professionnels/i)).toBeVisible();

  // Retour au catalogue.
  await page
    .getByRole("link", { name: /retour à l'espace bien-être/i })
    .click();
  await expect(page).toHaveURL(/\/bien-etre$/);
});
