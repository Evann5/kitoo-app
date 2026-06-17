export type DailyInspirationProps = {
  phrase: string;
  /** Chemin du fond décoratif (dégradé généré dans `public/inspiration/`). */
  image: string;
};

/**
 * Bloc « inspiration du jour » : une phrase encourageante posée sur un fond
 * apaisant. Le fond est **décoratif** (`aria-hidden`) — le sens passe par le
 * texte ; un voile sombre garantit le contraste (WCAG AA). Aucune animation
 * (compatible `prefers-reduced-motion`). La phrase/le fond sont choisis de façon
 * déterministe par date (cf. `getDailyInspiration`).
 */
export function DailyInspiration({ phrase, image }: DailyInspirationProps) {
  return (
    <section aria-label="Inspiration du jour" className="relative">
      <div className="rounded-card relative overflow-hidden">
        {/* Fond décoratif (dégradé généré) + voile pour le contraste. */}
        <div
          data-testid="inspiration-bg"
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(22,22,29,0.55), rgba(22,22,29,0.25)), url('${image}')`,
          }}
        />
        {/* Phrase du jour (≥ 16px, blanc sur voile sombre). */}
        <div className="relative flex min-h-[132px] flex-col justify-center gap-1 px-5 py-6">
          <span className="text-small font-bold tracking-wide text-white/80">
            Inspiration du jour
          </span>
          <p className="font-display text-heading text-white">{phrase}</p>
        </div>
      </div>
    </section>
  );
}

export default DailyInspiration;
