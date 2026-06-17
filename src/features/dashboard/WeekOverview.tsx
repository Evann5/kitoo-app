import Link from "next/link";
import { Card } from "@/components/ui";
import { moodOption } from "@/features/mood";
import type { SeriesPoint } from "./stats";

const weekdayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const fullFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export type WeekOverviewProps = {
  /** 7 derniers jours (du plus ancien au plus récent), `level` null = non noté. */
  days: SeriesPoint[];
};

/**
 * Aperçu de la semaine : 7 pastilles colorées par l'humeur du jour (jour non
 * noté = contour neutre). **Jamais le score 0–100** : seules la couleur et le
 * libellé qualitatif portent le sens (libellé accessible par jour). Le bloc
 * mène à l'onglet Suivi.
 */
export function WeekOverview({ days }: WeekOverviewProps) {
  const noted = days.some((d) => d.level !== null);

  return (
    <section aria-labelledby="week-title" className="flex flex-col gap-3">
      <h2 id="week-title" className="font-display text-title text-ink-900">
        Ta semaine en un coup d&apos;œil
      </h2>
      <Link href="/suivi" className="rounded-card focus-visible:outline-none">
        <Card className="hover:bg-ink-50 flex flex-col gap-3 transition-colors">
          <ol className="flex justify-between gap-1">
            {days.map((d) => {
              const opt = d.level !== null ? moodOption(d.level) : undefined;
              const date = parseLocal(d.date);
              return (
                <li
                  key={d.date}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span
                    aria-hidden
                    className="h-8 w-8 rounded-full border"
                    style={{
                      backgroundColor: opt?.color ?? "transparent",
                      borderColor: opt ? opt.color : "var(--ink-300)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="text-small text-ink-600 capitalize"
                  >
                    {weekdayFmt.format(date).slice(0, 1)}
                  </span>
                  <span className="sr-only">
                    {fullFmt.format(date)} : {opt ? opt.label : "non noté"}
                  </span>
                </li>
              );
            })}
          </ol>
          {!noted ? (
            <p className="text-small text-ink-600 text-center">
              Ta semaine se remplira au fil des jours.
            </p>
          ) : null}
        </Card>
      </Link>
    </section>
  );
}

export default WeekOverview;
