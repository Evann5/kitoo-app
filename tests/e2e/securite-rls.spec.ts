import { test, expect, type Page } from "@playwright/test";

/**
 * Isolation RLS : un utilisateur ne peut pas accéder aux données d'un autre.
 * Deux comptes distincts (contextes navigateur séparés) ; on vérifie via
 * l'export que chacun ne récupère QUE ses propres données - humeurs, mais
 * aussi sessions d'exercices (`exercise_sessions`) et résultats de tests
 * (`assessment_results`), les tables introduites en A12/A13.
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
  await page.getByRole("slider", { name: "Règle ton humeur" }).press("End");
  await page.getByRole("button", { name: /ajouter des détails/i }).click();
  await page.getByLabel(/envie d'en dire plus/i).fill(comment);
  await page.getByRole("button", { name: /mon humeur$/ }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();
}

/** A passe un test (WHO-5) et lance/arrête un exercice → données privées. */
async function addAssessmentAndExercise(page: Page) {
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

  await page.goto("/exercices");
  await page.locator("a[href^='/exercices/']").first().click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: "Arrêter" }).click();

  // Un message de chat de soutien (donnée privée).
  await page.goto("/chat");
  await page.getByLabel(/écris ton message/i).fill("coucou Kitoo");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("coucou Kitoo")).toBeVisible();
}

test("isolation RLS : aucun accès croisé entre deux comptes", async ({
  browser,
}) => {
  const emailA = testEmail("rlsA");
  const emailB = testEmail("rlsB");
  const secretA = "DONNEE-PRIVEE-DE-A";

  // Compte A : crée une humeur secrète, un résultat de test et une session.
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await signupConsentAddMood(pageA, emailA, secretA);
  await addAssessmentAndExercise(pageA);

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
  // B n'a passé aucun test, exercice ni chat : isolation des nouvelles tables.
  expect(dataB.assessment_results).toHaveLength(0);
  expect(dataB.exercise_sessions).toHaveLength(0);
  expect(dataB.chat_messages).toHaveLength(0);

  // L'export de A contient bien SES données (humeur + test + exercice).
  const exportA = await pageA.request.get("/api/export");
  const dataA = await exportA.json();
  expect(dataA.user.email).toBe(emailA);
  expect(dataA.mood_entries[0].comment).toBe(secretA);
  expect(dataA.assessment_results.length).toBeGreaterThanOrEqual(1);
  expect(dataA.exercise_sessions.length).toBeGreaterThanOrEqual(1);
  expect(dataA.chat_messages.length).toBeGreaterThanOrEqual(1);
  expect(JSON.stringify(dataB)).not.toContain("coucou Kitoo");

  await ctxA.close();
  await ctxB.close();
});
