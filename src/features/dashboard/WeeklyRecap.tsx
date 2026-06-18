import { Card } from "@/components/ui";
import { isRecapEmpty, type WeeklyRecap as Recap } from "./home";

export type WeeklyRecapProps = {
  recap: Recap;
  /** Ressenti qualitatif global (libellé, JAMAIS le score 0–100). */
  feelingLabel: string | null;
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="font-display text-heading text-ink-900">{value}</span>
      <span className="text-small text-ink-600">{label}</span>
    </div>
  );
}

/**
 * Récap **doux et qualitatif** de la semaine : jours notés, exercices faits,
 * ressenti global - sans jauge punitive ni score caché. Encouragement final.
 */
export function WeeklyRecap({ recap, feelingLabel }: WeeklyRecapProps) {
  return (
    <section aria-labelledby="recap-title" className="flex flex-col gap-3">
      <h2 id="recap-title" className="font-display text-title text-ink-900">
        Ton bien-être cette semaine
      </h2>
      <Card soft className="flex flex-col gap-4">
        {isRecapEmpty(recap) ? (
          <p className="text-body text-ink-700 text-center">
            Ta semaine se remplira au fil des jours - commence quand tu veux.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-around gap-2">
              <Stat
                value={String(recap.daysNoted)}
                label={recap.daysNoted > 1 ? "jours notés" : "jour noté"}
              />
              <Stat
                value={String(recap.exercises)}
                label={recap.exercises > 1 ? "exercices" : "exercice"}
              />
              {feelingLabel ? (
                <Stat value={feelingLabel} label="ressenti" />
              ) : null}
            </div>
            <p className="text-small text-ink-600 text-center">
              Continue à ton rythme 🌱
            </p>
          </>
        )}
      </Card>
    </section>
  );
}

export default WeeklyRecap;
