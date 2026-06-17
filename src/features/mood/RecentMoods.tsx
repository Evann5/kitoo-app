import { Card } from "@/components/ui";
import { MoodFace } from "@/components/ui";
import { moodOption, type MoodValue } from "./mood-config";
import type { MoodEntry } from "./queries";

export type RecentMoodsProps = {
  entries: MoodEntry[];
  /** Date du jour (YYYY-MM-DD) pour distinguer aujourd'hui des jours passés. */
  today: string;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatDay(isoDate: string): string {
  // isoDate = "YYYY-MM-DD" → date locale sans décalage de fuseau.
  const [y, m, d] = isoDate.split("-").map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
}

/**
 * Historique récent des humeurs (lecture seule). Les jours passés sont
 * consultables mais non modifiables — seule l'humeur du jour s'édite via le
 * formulaire. Chaque ligne montre la couleur/visage de l'humeur et son libellé.
 */
export function RecentMoods({ entries, today }: RecentMoodsProps) {
  if (entries.length === 0) {
    return (
      <Card soft className="text-center">
        <p className="text-body text-ink-700">
          Tu n&apos;as encore rien noté — c&apos;est quand tu veux.
        </p>
      </Card>
    );
  }

  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-3">
      <h2 id="recent-title" className="font-display text-title text-ink-900">
        Tes derniers jours
      </h2>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => {
          const option = moodOption(entry.level as MoodValue);
          const isToday = entry.entry_date === today;
          return (
            <li key={entry.id}>
              <Card padded={false} className="flex items-center gap-3 p-3">
                <MoodFace
                  level={option?.level ?? "neutral"}
                  size={36}
                  className="shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body text-ink-900 font-bold">
                    {option?.label ?? "—"}
                    {isToday ? (
                      <span className="text-small text-brand-700 ml-2 font-normal">
                        aujourd&apos;hui
                      </span>
                    ) : null}
                  </span>
                  <span className="text-small text-ink-600 capitalize">
                    {formatDay(entry.entry_date)}
                  </span>
                  {entry.comment ? (
                    <span className="text-small text-ink-600 mt-0.5 line-clamp-2">
                      {entry.comment}
                    </span>
                  ) : null}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="text-small text-ink-600">
        Les jours passés sont consultables, mais seule l&apos;humeur
        d&apos;aujourd&apos;hui peut être modifiée.
      </p>
    </section>
  );
}

export default RecentMoods;
