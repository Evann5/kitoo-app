import { test, expect } from "@playwright/test";

/**
 * Chat de soutien **simulé** : on ouvre le chat depuis l'accueil, on vérifie
 * l'étiquetage (réponses simulées) + le disclaimer, on envoie un message et on
 * reçoit une réponse simulée. Un message de détresse fait apparaître la
 * ressource d'aide (3114).
 */
test("accueil → chat de soutien → envoi → réponse simulée + ressource détresse", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-chat-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  // Bulle d'accès depuis l'accueil.
  await page.getByRole("link", { name: /échange de soutien/i }).click();
  await expect(page).toHaveURL(/\/chat$/);

  // Étiquetage clair + disclaimer.
  await expect(page.getByText(/simul/i).first()).toBeVisible();
  await expect(
    page.getByText(/ne remplace pas un suivi médical/i),
  ).toBeVisible();

  // Envoi d'un message → réponse simulée.
  await page.getByLabel(/écris ton message/i).fill("je suis stressé");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("je suis stressé")).toBeVisible();
  await expect(page.getByText(/respiration/i)).toBeVisible();

  // Message de détresse → ressource d'aide (3114).
  await page.getByLabel(/écris ton message/i).fill("j'ai envie d'en finir");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByRole("link", { name: /3114/ }).first()).toBeVisible();

  // Demande d'être rappelé·e par un·e professionnel·le.
  await page.getByRole("button", { name: /demander à être rappel/i }).click();
  await page.getByLabel(/téléphone/i).fill("0612345678");
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(page.getByText(/demande enregistrée/i)).toBeVisible();
});
