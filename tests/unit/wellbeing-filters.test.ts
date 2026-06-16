import { describe, it, expect } from "vitest";
import {
  filterResources,
  resourceThemes,
  resourceTypes,
  suggestByLevel,
  themeLabel,
  typeLabel,
} from "@/features/wellbeing/filters";
import type { Resource } from "@/features/wellbeing/queries";

const mk = (
  id: string,
  theme: string,
  type: string,
  mood_levels: number[],
): Resource => ({
  id,
  title: `R-${id}`,
  theme,
  type,
  summary: "s",
  content: "c",
  mood_levels,
  created_at: "2026-06-01T00:00:00Z",
});

const catalog: Resource[] = [
  mk("1", "stress", "exercice", [1, 2, 3]),
  mk("2", "stress", "article", [3, 4]),
  mk("3", "sommeil", "conseil", [1, 2]),
  mk("4", "confiance", "exercice", [4, 5]),
];

describe("filterResources", () => {
  it("filtre par thème", () => {
    const r = filterResources(catalog, { theme: "stress" });
    expect(r.map((x) => x.id)).toEqual(["1", "2"]);
  });

  it("cumule thème + type", () => {
    const r = filterResources(catalog, { theme: "stress", type: "exercice" });
    expect(r.map((x) => x.id)).toEqual(["1"]);
  });

  it("sans critère renvoie tout", () => {
    expect(filterResources(catalog, {})).toHaveLength(4);
  });
});

describe("themes / types distincts", () => {
  it("liste triée des thèmes", () => {
    expect(resourceThemes(catalog)).toEqual(["confiance", "sommeil", "stress"]);
  });
  it("liste triée des types", () => {
    expect(resourceTypes(catalog)).toEqual(["article", "conseil", "exercice"]);
  });
});

describe("suggestByLevel", () => {
  it("sélectionne les ressources dont mood_levels contient le niveau", () => {
    const low = suggestByLevel(catalog, 1);
    expect(low.map((x) => x.id).sort()).toEqual(["1", "3"]);
    const high = suggestByLevel(catalog, 5);
    expect(high.map((x) => x.id)).toEqual(["4"]);
  });
  it("respecte la limite", () => {
    expect(suggestByLevel(catalog, 3, 1)).toHaveLength(1);
  });
});

describe("labels FR", () => {
  it("traduit thèmes et types connus, capitalise le reste", () => {
    expect(themeLabel("stress")).toBe("Stress");
    expect(themeLabel("inconnu")).toBe("Inconnu");
    expect(typeLabel("exercice")).toBe("Exercices");
  });
});
