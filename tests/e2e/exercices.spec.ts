import { test, expect } from "@playwright/test";

/** Catalogue d'exercices → lecteur interactif (démarrage + contrôles). */
test("lancer un exercice : minuteur et contrôles", async ({ page }) => {
  const email = `evanelbaz.2005+e2e-ex-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  await page.goto("/exercices");
  await expect(page.getByRole("heading", { name: "Exercices" })).toBeVisible();

  // Ouvre un exercice et lance le minuteur.
  await page.getByRole("link", { name: /Respiration 4-7-8/ }).click();
  await expect(page).toHaveURL(/\/exercices\/respiration-478$/);
  await page.getByRole("button", { name: "Commencer" }).click();
  await expect(page.getByText("Inspire").first()).toBeVisible();

  // Arrête (enregistre une session non complétée) → retour à l'état initial.
  await page.getByRole("button", { name: "Arrêter" }).click();
  await expect(page.getByRole("button", { name: "Commencer" })).toBeVisible();
});
