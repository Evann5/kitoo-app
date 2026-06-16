import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("une route privée redirige un visiteur non connecté vers /connexion", async ({
    page,
  }) => {
    await page.goto("/profil");
    await expect(page).toHaveURL(/\/connexion\?redirect=%2Fprofil/);
    await expect(
      page.getByRole("heading", { name: /content de te revoir/i }),
    ).toBeVisible();
  });

  test("l'écran de connexion présente un formulaire accessible", async ({
    page,
  }) => {
    await page.goto("/connexion");
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Me connecter" }),
    ).toBeVisible();
    // Disclaimer médical présent.
    await expect(
      page.getByText(/ne remplace pas un suivi médical/i),
    ).toBeVisible();
  });

  test("l'inscription valide les entrées côté client", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByLabel("Adresse email").fill("pas-un-email");
    await page.getByLabel("Mot de passe", { exact: true }).fill("court");
    await page.getByLabel("Confirme ton mot de passe").fill("court");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText(/email n'est pas valide/i)).toBeVisible();
    await expect(page.getByText(/au moins 8 caractères/i)).toBeVisible();
    // Toujours sur la page d'inscription (pas de soumission).
    await expect(page).toHaveURL(/\/inscription$/);
  });

  test("navigation connexion ⇄ inscription", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByRole("link", { name: "Crée ton compte" }).click();
    await expect(page).toHaveURL(/\/inscription$/);
    await page.getByRole("link", { name: "Connecte-toi" }).click();
    await expect(page).toHaveURL(/\/connexion$/);
  });
});
