import { test, expect } from "@playwright/test";

/** Hub Ressources → filtre format + thème → lecture interne d'un article. */
test("ressources → filtre format + thème → lecture d'un article", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });

  // Hub.
  await page.goto("/ressources");
  await expect(
    page.getByRole("heading", { name: "Espace ressources" }),
  ).toBeVisible();

  // Filtres : format « À lire » + thème « Stress ».
  await page.getByRole("button", { name: "À lire" }).click();
  await page.getByRole("button", { name: "Stress" }).click();
  const card = page.getByRole("link", {
    name: /Apprivoiser le stress au quotidien/,
  });
  await expect(card).toBeVisible();

  // Lecture interne de l'article.
  await card.click();
  await expect(page).toHaveURL(/\/ressources\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Apprivoiser le stress au quotidien",
    }),
  ).toBeVisible();
  await expect(page.getByText(/validé par des professionnels/i)).toBeVisible();

  // Retour au hub.
  await page
    .getByRole("link", { name: /retour à l'espace ressources/i })
    .click();
  await expect(page).toHaveURL(/\/ressources$/);

  // Liens utiles : présents et sécurisés (cible externe + rel).
  const lien = page.getByRole("link", { name: /3114/ }).first();
  await expect(lien).toHaveAttribute("rel", /noopener/);
  await expect(lien).toHaveAttribute("target", "_blank");
});
