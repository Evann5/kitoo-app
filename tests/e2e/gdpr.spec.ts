import { test, expect } from "@playwright/test";

async function signup(page: import("@playwright/test").Page) {
  const email = `evanelbaz.2005+e2e-${Date.now()}-${Math.floor(performance.now())}@gmail.com`;
  const password = "motdepasse-e2e-1";
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
}

test("consentement, persistance a11y, export et suppression de compte", async ({
  page,
}) => {
  await signup(page);

  // Consentement explicite requis avant d'utiliser l'app.
  await expect(
    page.getByRole("heading", { name: /avant de commencer/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /j'accepte/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /bonjour|bon après-midi|bonsoir|bonne nuit/i,
    }),
  ).toBeVisible();

  // Mode dyslexie : appliqué et persistant après rechargement.
  await page.goto("/profil");
  await page.getByRole("switch", { name: "Mode dyslexie" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-font", "dyslexia");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-font", "dyslexia");

  // Export : fichier téléchargeable, authentifié.
  const res = await page.request.get("/api/export");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-disposition"]).toContain("attachment");
  const body = await res.json();
  expect(body.user.email).toContain("+e2e-");

  // Suppression de compte : confirmation explicite obligatoire.
  await page.getByRole("button", { name: "Supprimer mon compte" }).click();
  await page.getByLabel(/tape .* pour confirmer/i).fill("SUPPRIMER");
  await page.getByRole("button", { name: /supprimer définitivement/i }).click();

  // Redirigé vers l'accueil, déconnecté : la route privée renvoie à /connexion.
  await expect(page).toHaveURL(/\/(\?compte=supprime)?$/, { timeout: 15000 });
  await page.goto("/tableau-de-bord");
  await expect(page).toHaveURL(/\/connexion/);
});
