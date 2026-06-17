import { test, expect } from "@playwright/test";

/** Tab bar + bouton central « + » : ouverture du menu et navigation. */
test("le « + » ouvre le menu et mène à un écran d'action", async ({ page }) => {
  const email = `evanelbaz.2005+e2e-nav-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  // Ouvre la feuille d'actions.
  const fab = page.getByRole("button", { name: "Actions rapides" });
  await expect(fab).toHaveAttribute("aria-expanded", "false");
  await fab.click();
  const dialog = page.getByRole("dialog", { name: "Actions rapides" });
  await expect(dialog).toBeVisible();

  // Action « Passer un test » → /tests (placeholder « Bientôt »).
  await dialog.getByRole("link", { name: /passer un test/i }).click();
  await expect(page).toHaveURL(/\/tests$/);
  await expect(page.getByRole("heading", { name: "Les tests" })).toBeVisible();

  // Onglet Ressources → catalogue bien-être.
  await page.getByRole("link", { name: "Ressources" }).click();
  await expect(page).toHaveURL(/\/bien-etre$/);
  await expect(
    page.getByRole("heading", { name: "Espace bien-être" }),
  ).toBeVisible();
});
