import { test, expect } from "@playwright/test";

/** Passer un test standardisé → résultat orienté (historisé côté serveur). */
test("passer un test (WHO-5) → résultat orienté", async ({ page }) => {
  const email = `evanelbaz.2005+e2e-as-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  // Liste des tests → WHO-5.
  await page.goto("/tests");
  await expect(page.getByRole("heading", { name: "Tests" })).toBeVisible();
  await page.getByRole("link", { name: /Bien-être \(WHO-5\)/ }).click();
  await expect(page).toHaveURL(/\/tests\/who5$/);

  // Répond à chaque question (1re option de chaque groupe).
  const groups = page.getByRole("group");
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole("radio").first().check();
  }
  await page.getByRole("button", { name: "Voir mon résultat" }).click();

  // Résultat orienté + disclaimer + retour.
  await expect(
    page.getByText(/aperçu de ton bien-être|orientation/i),
  ).toBeVisible();
  await expect(
    page.getByText(/ne remplace pas un suivi médical/i).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Revenir aux tests" }),
  ).toBeVisible();
});
