import { moods, type MoodLevel } from "@/lib/moods";
import type { MascotPose } from "@/lib/illustrations";

/**
 * Configuration de l'échelle d'humeur du Mood Tracker : relie le niveau
 * numérique stocké en base (1–5) à l'échelle fixe du design system (libellé,
 * couleur) et à la réaction du compagnon (pose du koala).
 *
 * Mapping humeur → mascotte (cf. brief A4) :
 *   5 très positif → sunglasses · 4 positif → soda · 3 neutre → classic
 *   2 négatif → classic (TODO pose « légèrement triste ») · 1 très négatif → crying
 */

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type MoodOption = {
  value: MoodValue;
  /** Clé d'échelle du design system (couleur via variable CSS). */
  level: MoodLevel;
  label: string;
  color: string;
  pose: MascotPose;
};

const POSE_BY_VALUE: Record<MoodValue, MascotPose> = {
  5: "sunglasses",
  4: "soda",
  3: "classic",
  2: "classic", // TODO: pose « légèrement triste » quand l'asset existera
  1: "crying",
};

// Ordre d'affichage : du plus négatif (gauche) au plus positif (droite).
export const MOOD_OPTIONS: MoodOption[] = ([1, 2, 3, 4, 5] as MoodValue[]).map(
  (value) => {
    const mood = moods.find((m) => m.score === value)!;
    return {
      value,
      level: mood.level,
      label: mood.label,
      color: mood.color,
      pose: POSE_BY_VALUE[value],
    };
  },
);

/** Retrouve l'option d'humeur pour un niveau numérique, ou `undefined`. */
export function moodOption(value: number): MoodOption | undefined {
  return MOOD_OPTIONS.find((o) => o.value === value);
}

/** Pose de la mascotte pour un niveau (défaut `classic` si invalide). */
export function poseForMood(value: number): MascotPose {
  return moodOption(value)?.pose ?? "classic";
}

/** Vrai si la valeur est un niveau d'humeur valide (entier 1–5). */
export function isValidMoodValue(value: unknown): value is MoodValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}
