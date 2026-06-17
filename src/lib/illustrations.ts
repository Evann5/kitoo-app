/**
 * Registre central des illustrations Kitoo.
 *
 * Le code consomme une **clé** (jamais un chemin en dur). Les illustrations
 * réelles de la mascotte sont déposées dans `public/illustrations/` ; si un
 * fichier manque, le composant `Illustration` affiche un placeholder doux.
 * Voir `public/illustrations/README.md`.
 */

/** Nature de l'illustration → détermine le placeholder de repli. */
export type IllustrationKind = "mascot" | "decor";

export type IllustrationMeta = {
  /** Nom de fichier attendu dans `public/illustrations/`. */
  file: string;
  /** Texte alternatif par défaut (sens de l'image). Vide = décoratif. */
  alt: string;
  /** Dimensions intrinsèques (anti-CLS) : ratio réel de l'asset. */
  width: number;
  height: number;
  /** Type de repli si l'asset final est absent. */
  kind: IllustrationKind;
};

/** Émotions/poses de la mascotte koala (illustrations réelles). */
export type MascotPose =
  | "classic"
  | "crying"
  | "sleeping"
  | "soda"
  | "bubble-tea"
  | "sunglasses"
  | "skating"
  | "heart";

/** Toutes les clés du registre. */
export type IllustrationKey =
  | `kitoo-${MascotPose}`
  | "blob-soft"
  | "wave-divider";

export const illustrations: Record<IllustrationKey, IllustrationMeta> = {
  // Mascotte : assets carrés 1100×1100 (cf. public/illustrations/).
  "kitoo-classic": {
    file: "kitoo-classic.png",
    alt: "Le koala Kitoo, accueillant",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-crying": {
    // Réservé aux contextes de soutien (jamais en décoration gratuite).
    file: "kitoo-crying.png",
    alt: "Le koala Kitoo, ému : Kitoo est là pour t'écouter",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-sleeping": {
    file: "kitoo-sleeping.png",
    alt: "Le koala Kitoo se repose paisiblement",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-soda": {
    file: "kitoo-soda.png",
    alt: "Le koala Kitoo, détendu, une boisson à la main",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-bubble-tea": {
    file: "kitoo-bubble-tea.png",
    alt: "Le koala Kitoo savoure un bubble tea",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-sunglasses": {
    file: "kitoo-sunglasses.png",
    alt: "Le koala Kitoo, fier et de bonne humeur",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-skating": {
    file: "kitoo-skating.png",
    alt: "Le koala Kitoo avance avec énergie",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "kitoo-heart": {
    file: "kitoo-heart.png",
    alt: "Le koala Kitoo te tend un cœur, bienveillant",
    width: 1100,
    height: 1100,
    kind: "mascot",
  },
  "blob-soft": {
    file: "blob-soft.svg",
    alt: "",
    width: 600,
    height: 600,
    kind: "decor",
  },
  "wave-divider": {
    file: "wave-divider.svg",
    alt: "",
    width: 1440,
    height: 120,
    kind: "decor",
  },
};

/** Ratio largeur/hauteur d'une clé (utile pour réserver l'espace). */
export function illustrationRatio(key: IllustrationKey): number {
  const m = illustrations[key];
  return m.width / m.height;
}

/** Chemin public attendu de l'asset final d'une clé. */
export function illustrationSrc(key: IllustrationKey): string {
  return `/illustrations/${illustrations[key].file}`;
}

/** Liste ordonnée de toutes les clés (démo, itérations). */
export const illustrationKeys = Object.keys(illustrations) as IllustrationKey[];
