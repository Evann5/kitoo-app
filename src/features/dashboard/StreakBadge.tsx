import { Card } from "@/components/ui";

/**
 * Message d'encouragement selon la série. **Gamification positive uniquement** :
 * jamais de culpabilisation quand la série est à 0 — simple invitation douce.
 */
export function streakMessage(streak: number): string {
  if (streak <= 0) return "Note ton humeur quand tu veux pour lancer ta série.";
  if (streak === 1) return "1er jour, c'est un beau début.";
  if (streak >= 30) return `${streak} jours — quelle belle régularité !`;
  if (streak >= 7) return `${streak} jours d'affilée, continue comme ça !`;
  return `${streak} jours d'affilée.`;
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="text-brand-700 h-6 w-6"
      aria-hidden
      fill="none"
    >
      <path
        d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 19C8 16 11 13 15 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type StreakBadgeProps = { streak: number };

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <Card soft className="flex items-center gap-3">
      <span className="bg-brand-100 rounded-pill flex h-11 w-11 shrink-0 items-center justify-center">
        <LeafIcon />
      </span>
      <div className="flex flex-col">
        <span className="text-body text-ink-900 font-bold">
          {streak > 0
            ? `Série de ${streak} ${streak > 1 ? "jours" : "jour"}`
            : "Aucune série en cours"}
        </span>
        <span className="text-small text-ink-600">{streakMessage(streak)}</span>
      </div>
    </Card>
  );
}

export default StreakBadge;
