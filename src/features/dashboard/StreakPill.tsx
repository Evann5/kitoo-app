function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none">
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

export type StreakPillProps = { streak: number };

/**
 * Pastille de série compacte (en-tête). Indicateur **positif** : icône feuille
 * + nombre de jours, jamais punitif. Le libellé accessible donne le sens
 * complet ; le « j » abrégé reste lisible visuellement.
 */
export function StreakPill({ streak }: StreakPillProps) {
  return (
    <span
      aria-label={`Série de ${streak} ${streak > 1 ? "jours" : "jour"}`}
      className="bg-brand-100 text-brand-700 rounded-pill inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 font-bold"
    >
      <LeafIcon />
      <span aria-hidden className="text-small">
        {streak} j
      </span>
    </span>
  );
}

export default StreakPill;
