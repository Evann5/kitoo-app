import { test, expect } from "@playwright/test";

/**
 * Parcours complet : inscription → saisie d'humeur → réouverture préchargée.
 * Nécessite que la confirmation email soit désactivée (config Kitoo retenue),
 * sinon l'inscription n'ouvre pas de session.
 */
test("inscription → saisie d'humeur → réouverture préchargée", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  // Inscription (confirmation email désactivée → session immédiate).
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/profil/, { timeout: 15000 });

  // Saisie d'humeur.
  await page.goto("/humeur");
  await expect(
    page.getByRole("heading", { name: /comment tu te sens/i }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page
    .getByLabel(/envie d'en dire plus/i)
    .fill("Journée e2e tranquille.");
  await page.getByRole("button", { name: "Enregistrer mon humeur" }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();

  // Réouverture : l'entrée du jour est préchargée.
  await page.goto("/humeur");
  await expect(
    page.getByRole("radio", { name: "Bien", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByRole("button", { name: "Mettre à jour mon humeur" }),
  ).toBeVisible();
  await expect(page.getByLabel(/envie d'en dire plus/i)).toHaveValue(
    "Journée e2e tranquille.",
  );
});
