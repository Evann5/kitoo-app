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
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });

  // Consentement RGPD requis au premier accès.
  await page.getByRole("button", { name: /j'accepte/i }).click();

  // Tableau de bord : salutation + CTA « Noter » (aucune entrée encore).
  await expect(
    page.getByRole("heading", {
      name: /bonjour|bon après-midi|bonsoir|bonne nuit/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Noter mon humeur" }),
  ).toBeVisible();

  // Saisie d'humeur.
  await page.goto("/humeur");
  await expect(
    page.getByRole("heading", { name: /comment tu te sens/i }),
  ).toBeVisible();
  // Curseur de valence : End → humeur maximale (« Très bien »). Score caché.
  await page.getByRole("slider", { name: "Règle ton humeur" }).press("End");
  await expect(page.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "Très bien",
  );
  // Détails facultatifs (repliés) : on les ouvre pour ajouter un commentaire.
  await page.getByRole("button", { name: /ajouter des détails/i }).click();
  await page
    .getByLabel(/envie d'en dire plus/i)
    .fill("Journée e2e tranquille.");
  // Le libellé du bouton bascule en « Mettre à jour » après enregistrement :
  // on cible l'action par un nom qui couvre les deux états.
  await page.getByRole("button", { name: /mon humeur$/ }).click();
  await expect(page.getByText(/noté, prends soin de toi/i)).toBeVisible();

  // Réouverture : l'entrée du jour est préchargée (libellé, pas de nombre).
  await page.goto("/humeur");
  await expect(page.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "Très bien",
  );
  // Les détails s'ouvrent d'emblée car un commentaire existe déjà.
  await expect(
    page.getByRole("button", { name: "Mettre à jour mon humeur" }),
  ).toBeVisible();
  await expect(page.getByLabel(/envie d'en dire plus/i)).toHaveValue(
    "Journée e2e tranquille.",
  );

  // Le tableau de bord reflète l'entrée du jour : CTA « Modifier » + série.
  await page.goto("/tableau-de-bord");
  await expect(
    page.getByRole("link", { name: "Modifier mon humeur" }),
  ).toBeVisible();
  await expect(page.getByLabel(/série de 1 jour/i)).toBeVisible();
});
