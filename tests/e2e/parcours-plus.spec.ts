import { test, expect, type Page } from "@playwright/test";

/**
 * Menu « + » (FAB) : les trois actions rapides mènent au bon écran —
 * noter une humeur, passer un test, faire un exercice.
 */

async function openPlusMenu(page: Page) {
  const fab = page.getByRole("button", { name: "Actions rapides" });
  await fab.click();
  return page.getByRole("dialog", { name: "Actions rapides" });
}

test("le menu « + » mène aux 3 actions (humeur, test, exercice)", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-plus-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";

  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  const actions: { name: RegExp; url: RegExp }[] = [
    { name: /noter mon humeur/i, url: /\/humeur$/ },
    { name: /passer un test/i, url: /\/tests$/ },
    { name: /faire un exercice/i, url: /\/exercices$/ },
  ];

  for (const action of actions) {
    await page.goto("/tableau-de-bord");
    const dialog = await openPlusMenu(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: action.name }).click();
    await expect(page).toHaveURL(action.url);
  }
});
