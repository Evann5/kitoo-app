import { test, expect, type Page } from "@playwright/test";

/**
 * Isolation RLS : un utilisateur ne peut pas accéder aux données d'un autre.
 * Deux comptes distincts (contextes navigateur séparés) ; on vérifie via
 * l'export que chacun ne récupère QUE ses propres humeurs.
 */

const PASSWORD = "motdepasse-e2e-1";
// Email en minuscules (Supabase normalise l'adresse en lowercase).
const testEmail = (tag: string) =>
  `evanelbaz.2005+e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@gmail.com`.toLowerCase();

async function signupConsentAddMood(
  page: Page,
  email: string,
  comment: string,
) {
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirme ton mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();
  await page.goto("/humeur");
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page.getByLabel(/envie d'en dire plus/i).fill(comment);
  await page.getByRole("button", { name: "Enregistrer mon humeur" }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();
}

test("isolation RLS : aucun accès croisé entre deux comptes", async ({
  browser,
}) => {
  const emailA = testEmail("rlsA");
  const emailB = testEmail("rlsB");
  const secretA = "DONNEE-PRIVEE-DE-A";

  // Compte A : crée une humeur avec un commentaire secret.
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await signupConsentAddMood(pageA, emailA, secretA);

  // Compte B : crée sa propre humeur.
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await signupConsentAddMood(pageB, emailB, "donnee de B");

  // L'export de B ne contient QUE les données de B.
  const exportB = await pageB.request.get("/api/export");
  const dataB = await exportB.json();
  expect(dataB.user.email).toBe(emailB);
  expect(JSON.stringify(dataB)).not.toContain(secretA);
  expect(dataB.mood_entries).toHaveLength(1);
  expect(dataB.mood_entries[0].comment).toBe("donnee de B");

  // L'export de A contient bien SES données (et son commentaire).
  const exportA = await pageA.request.get("/api/export");
  const dataA = await exportA.json();
  expect(dataA.user.email).toBe(emailA);
  expect(dataA.mood_entries[0].comment).toBe(secretA);

  await ctxA.close();
  await ctxB.close();
});
