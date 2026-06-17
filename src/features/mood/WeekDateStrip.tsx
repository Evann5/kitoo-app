import { cn } from "@/lib/cn";

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

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export type WeekDateStripProps = {
  /** Jour courant "YYYY-MM-DD" — mis en évidence. */
  today: string;
};

/**
 * Bandeau de la semaine (lundi → dimanche) contenant `today`, jour courant en
 * évidence. Purement informatif : liste sémantique, le jour actif porte
 * `aria-current="date"` et un libellé accessible complet.
 */
export function WeekDateStrip({ today }: WeekDateStripProps) {
  const base = parseLocal(today);
  // Recule jusqu'au lundi (getDay : 0 = dimanche).
  const offsetToMonday = (base.getDay() + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - offsetToMonday);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <ol className="flex justify-between gap-1" aria-label="Semaine en cours">
      {days.map((d) => {
        const iso = isoOf(d);
        const current = iso === today;
        return (
          <li key={iso} className="flex-1">
            <div
              aria-current={current ? "date" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl py-2",
                current ? "bg-brand-700 text-white" : "text-ink-600",
              )}
            >
              <span aria-hidden className="text-small font-bold capitalize">
                {weekdayFmt.format(d).slice(0, 3)}
              </span>
              <span
                aria-hidden
                className={cn(
                  "text-body font-bold",
                  current ? "text-white" : "text-ink-900",
                )}
              >
                {d.getDate()}
              </span>
              <span className="sr-only">{fullFmt.format(d)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default WeekDateStrip;
