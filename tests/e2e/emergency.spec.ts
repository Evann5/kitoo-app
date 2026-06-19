import { test, expect } from "@playwright/test";

/**
 * Aide d'urgence + FAB de chat collant : bouton SOS de l'accueil → /urgence
 * (numéros + appel en un geste), et présence/absence du FAB selon la route.
 */
test("bouton SOS → /urgence, et FAB de chat affiché selon la route", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-sos-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  const fab = page.getByRole("link", { name: "Ouvrir l'échange de soutien" });
  // FAB présent sur l'accueil.
  await expect(fab).toBeVisible();

  // Bouton SOS → /urgence (appel en un geste).
  await page.getByRole("link", { name: /besoin d'aide maintenant/i }).click();
  await expect(page).toHaveURL(/\/urgence$/);
  await expect(page.getByText(/danger immédiat/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /appeler le 3114/i }),
  ).toHaveAttribute("href", "tel:3114");
  // FAB visible aussi sur /urgence.
  await expect(fab).toBeVisible();

  // FAB absent sur Humeur, Profil, Exercices, Tests.
  for (const route of ["/humeur", "/profil", "/exercices", "/tests"]) {
    await page.goto(route);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(fab).toHaveCount(0);
  }

  // FAB présent sur Suivi, et il ouvre le chat.
  await page.goto("/suivi");
  await expect(fab).toBeVisible();
  await fab.click();
  await expect(page).toHaveURL(/\/chat$/);
});
