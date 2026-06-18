import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceCatalog } from "@/features/wellbeing/ResourceCatalog";
import { ResourceReader } from "@/features/wellbeing/ResourceReader";
import type { Resource } from "@/features/wellbeing/queries";

const mk = (
  id: string,
  title: string,
  theme: string,
  type: string,
): Resource => ({
  id,
  title,
  theme,
  type,
  summary: `résumé ${title}`,
  content: "Paragraphe 1.\n\nParagraphe 2.",
  mood_levels: [1, 2, 3],
  created_at: "2026-06-01T00:00:00Z",
});

const catalog: Resource[] = [
  mk("1", "Respirer", "stress", "exercice"),
  mk("2", "Mieux dormir", "sommeil", "conseil"),
  mk("3", "Lire le stress", "stress", "article"),
];

describe("ResourceCatalog - filtres", () => {
  it("filtre par thème au clic et reflète aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    // 3 cartes au départ.
    expect(screen.getByRole("link", { name: /Respirer/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Mieux dormir/ }),
    ).toBeInTheDocument();

    const sommeil = screen.getByRole("button", { name: "Sommeil" });
    await user.click(sommeil);
    expect(sommeil).toHaveAttribute("aria-pressed", "true");

    // Seule la ressource sommeil reste.
    expect(
      screen.getByRole("link", { name: /Mieux dormir/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Respirer/ })).toBeNull();
  });

  it("cumule thème + type", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    await user.click(screen.getByRole("button", { name: "Stress" }));
    await user.click(screen.getByRole("button", { name: "Articles" }));
    expect(
      screen.getByRole("link", { name: /Lire le stress/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Respirer/ })).toBeNull();
  });

  it("affiche l'état « aucun résultat » quand rien ne matche", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    // sommeil + exercice → aucune ressource.
    await user.click(screen.getByRole("button", { name: "Sommeil" }));
    await user.click(screen.getByRole("button", { name: "Exercices" }));
    expect(screen.getByText(/rien ici pour ce filtre/i)).toBeInTheDocument();
  });
});

describe("ResourceReader", () => {
  it("affiche le contenu, la mention de validation et aucun lien externe", () => {
    const { container } = render(<ResourceReader resource={catalog[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Respirer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/validé par des professionnels/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Paragraphe 2/)).toBeInTheDocument();

    // Aucun lien sortant : tous les href sont internes (commencent par "/").
    const links = within(container).getAllByRole("link");
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith("/")).toBe(true);
      expect(link).not.toHaveAttribute("target", "_blank");
    }
  });
});
