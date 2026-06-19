import { describe, it, expect } from "vitest";
import {
  filterResources,
  resourceThemes,
  resourceFormats,
  suggestByLevel,
  themeLabel,
  formatLabel,
} from "@/features/wellbeing/filters";
import type { Resource } from "@/features/wellbeing/queries";

const mk = (
  id: string,
  theme: string,
  format: string,
  mood_levels: number[],
): Resource => ({
  id,
  title: `R-${id}`,
  theme,
  type: format,
  format,
  summary: "s",
  content: "c",
  url: null,
  media_embed: null,
  source: null,
  author_or_validation: null,
  read_time: null,
  duration: null,
  cover_image: null,
  slug: `r-${id}`,
  mood_levels,
  created_at: "2026-06-01T00:00:00Z",
});

const catalog: Resource[] = [
  mk("1", "stress", "article", [1, 2, 3]),
  mk("2", "stress", "video", [3, 4]),
  mk("3", "sommeil", "article", [1, 2]),
  mk("4", "confiance", "podcast", [4, 5]),
  mk("5", "ecoute", "lien", [1, 2, 3, 4, 5]),
];

describe("filterResources", () => {
  it("filtre par thème", () => {
    const r = filterResources(catalog, { theme: "stress" });
    expect(r.map((x) => x.id)).toEqual(["1", "2"]);
  });

  it("filtre par format", () => {
    const r = filterResources(catalog, { format: "article" });
    expect(r.map((x) => x.id)).toEqual(["1", "3"]);
  });

  it("cumule thème + format", () => {
    const r = filterResources(catalog, { theme: "stress", format: "video" });
    expect(r.map((x) => x.id)).toEqual(["2"]);
  });

  it("sans critère renvoie tout", () => {
    expect(filterResources(catalog, {})).toHaveLength(5);
  });
});

describe("themes / formats distincts", () => {
  it("liste triée des thèmes", () => {
    expect(resourceThemes(catalog)).toEqual([
      "confiance",
      "ecoute",
      "sommeil",
      "stress",
    ]);
  });
  it("liste triée des formats", () => {
    expect(resourceFormats(catalog)).toEqual([
      "article",
      "lien",
      "podcast",
      "video",
    ]);
  });
});

describe("suggestByLevel", () => {
  it("sélectionne les ressources dont mood_levels contient le niveau", () => {
    const low = suggestByLevel(catalog, 1);
    expect(low.map((x) => x.id).sort()).toEqual(["1", "3"]);
  });
  it("exclut les liens utiles des suggestions", () => {
    const all = suggestByLevel(catalog, 5, 10);
    expect(all.every((r) => r.format !== "lien")).toBe(true);
    expect(all.map((x) => x.id)).toEqual(["4"]);
  });
  it("respecte la limite", () => {
    expect(suggestByLevel(catalog, 3, 1)).toHaveLength(1);
  });
});

describe("labels FR", () => {
  it("traduit thèmes et formats connus, capitalise le reste", () => {
    expect(themeLabel("stress")).toBe("Stress");
    expect(themeLabel("inconnu")).toBe("Inconnu");
    expect(formatLabel("article")).toBe("À lire");
    expect(formatLabel("podcast")).toBe("À écouter");
    expect(formatLabel("video")).toBe("À regarder");
  });
});
