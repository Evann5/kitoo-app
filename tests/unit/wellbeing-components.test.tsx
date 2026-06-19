import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceCatalog } from "@/features/wellbeing/ResourceCatalog";
import { ArticleReader } from "@/features/wellbeing/ArticleReader";
import { MediaResource } from "@/features/wellbeing/MediaResource";
import { UsefulLinks } from "@/features/wellbeing/UsefulLinks";
import type { Resource } from "@/features/wellbeing/queries";

const mk = (overrides: Partial<Resource> & { id: string }): Resource => ({
  title: `R-${overrides.id}`,
  theme: "stress",
  type: "article",
  format: "article",
  summary: `résumé ${overrides.id}`,
  content: "Paragraphe 1.\n\n## Sous-titre\n\n- point un\n- point deux",
  url: null,
  media_embed: null,
  source: null,
  author_or_validation: null,
  read_time: null,
  duration: null,
  cover_image: null,
  slug: `r-${overrides.id}`,
  mood_levels: [1, 2, 3],
  created_at: "2026-06-01T00:00:00Z",
  ...overrides,
});

const catalog: Resource[] = [
  mk({ id: "1", title: "Respirer", theme: "stress", format: "article" }),
  mk({
    id: "2",
    title: "Podcast émotions",
    theme: "anxiete",
    format: "podcast",
  }),
  mk({
    id: "3",
    title: "Lire le sommeil",
    theme: "sommeil",
    format: "article",
  }),
];

describe("ResourceCatalog - filtres", () => {
  it("filtre par thème au clic et reflète aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    expect(screen.getByRole("link", { name: /Respirer/ })).toBeInTheDocument();

    const sommeil = screen.getByRole("button", { name: "Sommeil" });
    await user.click(sommeil);
    expect(sommeil).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("link", { name: /Lire le sommeil/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Respirer/ })).toBeNull();
  });

  it("filtre par format", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    await user.click(screen.getByRole("button", { name: "À écouter" }));
    expect(
      screen.getByRole("link", { name: /Podcast émotions/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Respirer/ })).toBeNull();
  });

  it("affiche l'état « aucun résultat » quand rien ne matche", async () => {
    const user = userEvent.setup();
    render(<ResourceCatalog resources={catalog} />);
    // sommeil + podcast → aucune ressource.
    await user.click(screen.getByRole("button", { name: "Sommeil" }));
    await user.click(screen.getByRole("button", { name: "À écouter" }));
    expect(screen.getByText(/rien ici pour ce filtre/i)).toBeInTheDocument();
  });
});

describe("ArticleReader", () => {
  it("rend le markdown-lite (titres, listes), la validation et aucun lien externe", () => {
    const { container } = render(
      <ArticleReader
        resource={mk({
          id: "a",
          title: "Respirer",
          author_or_validation:
            "Rédigé et validé par des professionnels de santé",
          read_time: "6 min",
        })}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Respirer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Sous-titre" }),
    ).toBeInTheDocument();
    expect(screen.getByText("point un")).toBeInTheDocument();
    expect(
      screen.getByText(/validé par des professionnels/i),
    ).toBeInTheDocument();

    // Aucun lien sortant : tous les href sont internes.
    const links = within(container).getAllByRole("link");
    for (const link of links) {
      expect((link.getAttribute("href") ?? "").startsWith("/")).toBe(true);
      expect(link).not.toHaveAttribute("target", "_blank");
    }
  });
});

describe("MediaResource", () => {
  it("propose un lien externe sécurisé (rel + target) vers la source", () => {
    render(
      <MediaResource
        resource={mk({
          id: "m",
          title: "Cohérence cardiaque",
          format: "video",
          url: "https://example.com/video",
          source: "YouTube",
          duration: "5 min",
          content: "",
        })}
      />,
    );
    const link = screen.getByRole("link", { name: /Regarder sur YouTube/ });
    expect(link).toHaveAttribute("href", "https://example.com/video");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("UsefulLinks", () => {
  it("regroupe par thème et sécurise les liens externes", () => {
    render(
      <UsefulLinks
        links={[
          mk({
            id: "l1",
            title: "3114",
            theme: "ecoute",
            format: "lien",
            url: "https://3114.fr",
            source: "3114",
          }),
          mk({
            id: "l2",
            title: "Psycom",
            theme: "information",
            format: "lien",
            url: "https://www.psycom.org",
            source: "Psycom",
          }),
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /3114/ });
    expect(link).toHaveAttribute("href", "https://3114.fr");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // Les deux thèmes apparaissent comme sous-titres.
    expect(screen.getByText("Écoute")).toBeInTheDocument();
    expect(screen.getByText("S'informer")).toBeInTheDocument();
  });

  it("ne rend rien sans lien", () => {
    const { container } = render(<UsefulLinks links={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
