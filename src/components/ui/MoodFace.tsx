import type { MoodLevel } from "@/lib/moods";
import { moods } from "@/lib/moods";
import { cn } from "@/lib/cn";

/** Tracé de la bouche par niveau (du grand sourire au froncement doux). */
const MOUTHS: Record<MoodLevel, string> = {
  "very-positive": "M32 58 Q50 84 68 58",
  positive: "M35 60 Q50 76 65 60",
  neutral: "M37 66 H63",
  negative: "M35 71 Q50 60 65 71",
  "very-negative": "M34 73 Q50 57 66 73",
};

export type MoodFaceProps = {
  level: MoodLevel;
  className?: string;
  /** Taille en px (cible tactile ≥ 44px recommandée). @default 48 */
  size?: number;
};

/**
 * Visage d'humeur rond, dessiné sur-mesure (set de marque, **pas un emoji**,
 * jamais utilisé comme affordance UI seule). Purement **décoratif**
 * (`aria-hidden`) : le libellé textuel de l'humeur porte le sens. Couleur fixe
 * issue de l'échelle d'humeur du design system.
 */
export function MoodFace({ level, className, size = 48 }: MoodFaceProps) {
  const mood = moods.find((m) => m.level === level) ?? moods[1];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill={mood.color} />
      {/* yeux */}
      <circle cx="36" cy="42" r="5" fill="#16161D" />
      <circle cx="64" cy="42" r="5" fill="#16161D" />
      {/* bouche */}
      <path
        d={MOUTHS[level]}
        stroke="#16161D"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default MoodFace;
