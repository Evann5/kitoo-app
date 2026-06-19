import { test, expect, type Page } from "@playwright/test";

/**
 * Parcours utilisateur complet (compte de test créé à la volée) :
 * inscription → consentement → saisie d'humeur → modification → tableau de bord
 * → espace bien-être (filtre + lecture) → export → déconnexion + protection des
 * routes. Le compte de test est nettoyé séparément (voir README / scripts).
 */

const PASSWORD = "motdepasse-e2e-1";
const testEmail = () =>
  `evanelbaz.2005+e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@gmail.com`;

async function signupAndConsent(page: Page, email: string) {
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirme ton mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();
}

test("parcours complet : inscription → humeur → dashboard → bien-être → export → déconnexion", async ({
  page,
}) => {
  const email = testEmail();
  await signupAndConsent(page, email);

  // Tableau de bord (post-consentement).
  await expect(
    page.getByRole("heading", {
      name: /bonjour|bon après-midi|bonsoir|bonne nuit/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Noter mon humeur" }),
  ).toBeVisible();

  // Saisie d'humeur. Curseur : Home → humeur minimale. Score caché.
  await page.goto("/humeur");
  await page.getByRole("slider", { name: "Règle ton humeur" }).press("Home");
  await page.getByRole("button", { name: /ajouter des détails/i }).click();
  await page.getByLabel(/envie d'en dire plus/i).fill("Première note e2e.");
  await page.getByRole("button", { name: /mon humeur$/ }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();

  // Modification le même jour (1 entrée/jour, pas de doublon) : End → max.
  await page.reload();
  await page.getByRole("slider").press("End");
  await page.getByRole("button", { name: "Mettre à jour mon humeur" }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();

  // Dashboard reflète l'entrée : CTA « Modifier » + série.
  await page.goto("/tableau-de-bord");
  await expect(
    page.getByRole("link", { name: "Modifier mon humeur" }),
  ).toBeVisible();
  await expect(page.getByLabel(/série de 1 jour/i)).toBeVisible();

  // Accueil enrichi : aperçu semaine + accès rapides + récap.
  await expect(
    page.getByRole("heading", { name: /ta semaine/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Passer un test" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /ton bien-être cette semaine/i }),
  ).toBeVisible();

  // Espace ressources : filtre + lecture interne d'un article.
  await page.goto("/ressources");
  await page.getByRole("button", { name: "Stress" }).click();
  await page
    .getByRole("link", { name: /Apprivoiser le stress au quotidien/ })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Apprivoiser le stress au quotidien",
    }),
  ).toBeVisible();

  // Export authentifié de ses données.
  const res = await page.request.get("/api/export");
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.user.email).toBe(email);
  expect(data.mood_entries.length).toBe(1);
  expect(data.mood_entries[0].level).toBe(5);

  // Déconnexion + protection des routes.
  await page.goto("/profil");
  await page.getByRole("button", { name: "Me déconnecter" }).click();
  await expect(page).toHaveURL(/\/connexion/, { timeout: 15000 });
  await page.goto("/tableau-de-bord");
  await expect(page).toHaveURL(/\/connexion/);
});
