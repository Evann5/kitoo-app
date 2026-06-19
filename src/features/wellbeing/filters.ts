import type { Resource } from "./queries";

/**
 * Filtrage et suggestion des ressources - fonctions **pures et testables**. Le
 * catalogue est chargé une fois (sous RLS) puis filtré côté client. Le hub
 * couvre plusieurs **formats** (article / podcast / video / lien) ; les « liens
 * utiles » (`lien`) sont présentés à part (cf. `UsefulLinks`).
 */

export type ResourceFilter = {
  /** Slug de thème (ex. "stress"), ou null = tous. */
  theme?: string | null;
  /** Format (article / podcast / video / lien), ou null = tous. */
  format?: string | null;
};

/** Filtre par thème ET format (cumulables). Un critère absent/null = ignoré. */
export function filterResources(
  resources: Resource[],
  { theme, format }: ResourceFilter,
): Resource[] {
  return resources.filter(
    (r) => (!theme || r.theme === theme) && (!format || r.format === format),
  );
}

/** Liste triée des thèmes distincts présents dans une sélection. */
export function resourceThemes(resources: Resource[]): string[] {
  return Array.from(new Set(resources.map((r) => r.theme))).sort();
}

/** Liste triée des formats distincts présents dans une sélection. */
export function resourceFormats(resources: Resource[]): string[] {
  return Array.from(new Set(resources.map((r) => r.format))).sort();
}

/**
 * Suggère des ressources adaptées à un niveau d'humeur (1–5) : celles dont
 * `mood_levels` contient ce niveau. Les liens utiles sont exclus (on suggère du
 * contenu à lire/écouter/regarder). Mapping bienveillant, jamais prescriptif.
 */
export function suggestByLevel(
  resources: Resource[],
  level: number,
  limit = 3,
): Resource[] {
  return resources
    .filter((r) => r.format !== "lien" && r.mood_levels.includes(level))
    .slice(0, limit);
}

/** Libellés FR des thèmes connus (fallback : capitalisation du slug). */
const THEME_LABELS: Record<string, string> = {
  stress: "Stress",
  sommeil: "Sommeil",
  anxiete: "Anxiété",
  confiance: "Confiance",
  respiration: "Respiration",
  etudes: "Études",
  relations: "Relations",
  ecoute: "Écoute",
  information: "S'informer",
};

export function themeLabel(slug: string): string {
  return THEME_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Libellés FR des formats (pour les filtres et badges). */
const FORMAT_LABELS: Record<string, string> = {
  article: "À lire",
  podcast: "À écouter",
  video: "À regarder",
  lien: "Lien",
};

export function formatLabel(slug: string): string {
  return FORMAT_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
