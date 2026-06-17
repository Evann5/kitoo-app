import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function criticalViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "critical");
}

test("aucune violation a11y critique sur les pages publiques", async ({
  page,
}) => {
  for (const path of ["/", "/connexion", "/inscription", "/confidentialite"]) {
    await page.goto(path);
    const critical = await criticalViolations(page);
    expect(
      critical,
      `${path}: ${critical.map((v) => v.id).join(", ")}`,
    ).toEqual([]);
  }
});

test("aucune violation a11y critique sur les pages privées", async ({
  page,
}) => {
  const email = `evanelbaz.2005+e2e-axe-${Date.now()}@gmail.com`;
  const password = "motdepasse-e2e-1";
  await page.goto("/inscription");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirme ton mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord/, { timeout: 15000 });
  await page.getByRole("button", { name: /j'accepte/i }).click();

  for (const path of [
    "/tableau-de-bord",
    "/humeur",
    "/suivi",
    "/ressources",
    "/exercices",
    "/tests",
    "/tests/who5",
    "/profil",
  ]) {
    await page.goto(path);
    const critical = await criticalViolations(page);
    expect(
      critical,
      `${path}: ${critical.map((v) => v.id).join(", ")}`,
    ).toEqual([]);
  }

  // Pages de détail dynamiques (slug / id) atteintes par clic.
  await page.goto("/exercices");
  await page.locator("a[href^='/exercices/']").first().click();
  await expect(page).toHaveURL(/\/exercices\/.+/);
  let critical = await criticalViolations(page);
  expect(critical, `exercice: ${critical.map((v) => v.id).join(", ")}`).toEqual(
    [],
  );

  await page.goto("/ressources");
  await page.locator("a[href^='/ressources/']").first().click();
  await expect(page).toHaveURL(/\/ressources\/.+/);
  critical = await criticalViolations(page);
  expect(
    critical,
    `ressource: ${critical.map((v) => v.id).join(", ")}`,
  ).toEqual([]);
});
