import type { Resource } from "./queries";

/**
 * Filtrage et suggestion des ressources bien-être - fonctions **pures et
 * testables**. Le catalogue est chargé une fois (sous RLS) puis filtré côté
 * client pour une expérience réactive.
 */

export type ResourceFilter = {
  /** Slug de thème (ex. "stress"), ou null = tous. */
  theme?: string | null;
  /** Type (article / exercice / conseil), ou null = tous. */
  type?: string | null;
};

/** Filtre par thème ET type (cumulables). Un critère absent/null = ignoré. */
export function filterResources(
  resources: Resource[],
  { theme, type }: ResourceFilter,
): Resource[] {
  return resources.filter(
    (r) => (!theme || r.theme === theme) && (!type || r.type === type),
  );
}

/** Liste triée des thèmes distincts présents dans le catalogue. */
export function resourceThemes(resources: Resource[]): string[] {
  return Array.from(new Set(resources.map((r) => r.theme))).sort();
}

/** Liste triée des types distincts présents dans le catalogue. */
export function resourceTypes(resources: Resource[]): string[] {
  return Array.from(new Set(resources.map((r) => r.type))).sort();
}

/**
 * Suggère des ressources adaptées à un niveau d'humeur (1–5) : celles dont
 * `mood_levels` contient ce niveau. Mapping bienveillant, jamais prescriptif -
 * ex. humeur basse → contenus d'apaisement (tagués pour les niveaux bas).
 */
export function suggestByLevel(
  resources: Resource[],
  level: number,
  limit = 3,
): Resource[] {
  return resources.filter((r) => r.mood_levels.includes(level)).slice(0, limit);
}

/** Libellés FR des thèmes connus (fallback : capitalisation du slug). */
const THEME_LABELS: Record<string, string> = {
  stress: "Stress",
  sommeil: "Sommeil",
  confiance: "Confiance",
  relations: "Relations",
};

export function themeLabel(slug: string): string {
  return THEME_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Libellés FR des types (au pluriel pour les filtres). */
const TYPE_LABELS: Record<string, string> = {
  article: "Articles",
  exercice: "Exercices",
  conseil: "Conseils",
};

export function typeLabel(slug: string): string {
  return TYPE_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
