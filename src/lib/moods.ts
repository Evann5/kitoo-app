/**
 * Échelle d'humeur Kitoo - source unique pour le Mood Tracker et les visuels.
 *
 * Les couleurs pointent vers les variables CSS `--mood-*` définies dans
 * `globals.css` (valeurs par défaut + override daltonisme via
 * `data-contrast="colorblind"`), pour rester cohérentes avec le design system.
 */

/** Niveaux d'humeur, du plus positif au plus négatif. */
export type MoodLevel =
  | "very-positive"
  | "positive"
  | "neutral"
  | "negative"
  | "very-negative";

export type Mood = {
  level: MoodLevel;
  /** Libellé textuel (porte le sens - les visages d'humeur sont décoratifs). */
  label: string;
  /** Couleur de l'humeur (variable CSS du DS). */
  color: string;
  /** Score numérique (1 = très négatif … 5 = très positif) pour les stats. */
  score: number;
};

/** Ordre canonique d'affichage (positif → négatif). */
export const moods: Mood[] = [
  {
    level: "very-positive",
    label: "Très bien",
    color: "var(--mood-very-positive)",
    score: 5,
  },
  {
    level: "positive",
    label: "Bien",
    color: "var(--mood-positive)",
    score: 4,
  },
  {
    level: "neutral",
    label: "Neutre",
    color: "var(--mood-neutral)",
    score: 3,
  },
  {
    level: "negative",
    label: "Pas terrible",
    color: "var(--mood-negative)",
    score: 2,
  },
  {
    level: "very-negative",
    label: "Difficile",
    color: "var(--mood-very-negative)",
    score: 1,
  },
];

/** Toutes les valeurs de niveaux (utile pour itérer/valider). */
export const moodLevels = moods.map((m) => m.level);

/** Retrouve une humeur par niveau. */
export function moodByLevel(level: MoodLevel): Mood {
  return moods.find((m) => m.level === level) ?? moods[2];
}
