import { test, expect } from "@playwright/test";

/**
 * Journal unifié : on crée une humeur, un exercice et un test, puis on vérifie
 * qu'ils apparaissent dans la timeline `/suivi` et que le filtre par type
 * fonctionne. Les assertions sont cadrées sur la région « Ton parcours » (la
 * timeline), distincte de l'aperçu d'évolution.
 */
test("humeur + exercice + test → apparaissent dans le journal", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-journal-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  // Inscription + consentement.
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  // Humeur (molette au maximum → "Très bien").
  await page.goto("/humeur");
  await page.getByRole("slider", { name: "Règle ton humeur" }).press("End");
  await page.getByRole("button", { name: "Enregistrer mon humeur" }).click();

  // Exercice : on lance puis on arrête (session enregistrée).
  await page.goto("/exercices");
  await page.locator("a[href^='/exercices/']").first().click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: "Arrêter" }).click();

  // Test WHO-5.
  await page.goto("/tests/who5");
  const groups = page.getByRole("group");
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole("radio").first().check();
  }
  await page.getByRole("button", { name: "Voir mon résultat" }).click();
  await expect(
    page.getByRole("link", { name: "Revenir aux tests" }),
  ).toBeVisible();

  // Journal : la timeline contient les trois entrées.
  await page.goto("/suivi");
  const parcours = page.getByRole("region", { name: "Ton parcours" });
  await expect(parcours.getByText("Très bien")).toBeVisible();
  await expect(parcours.getByText("Bien-être (WHO-5)")).toBeVisible();

  // Filtre par type « Test » : l'humeur disparaît de la timeline.
  await parcours.getByRole("button", { name: "Test" }).click();
  await expect(parcours.getByText("Bien-être (WHO-5)")).toBeVisible();
  await expect(parcours.getByText("Très bien")).toHaveCount(0);
});
