"use client";

import type { JournalKind, JournalPeriod } from "./aggregate";

const KINDS: { value: JournalKind | "all"; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "mood", label: "Humeur" },
  { value: "exercise", label: "Exercice" },
  { value: "assessment", label: "Test" },
];

const PERIODS: { value: JournalPeriod; label: string }[] = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "all", label: "Tout" },
];

function pill(active: boolean): string {
  return active
    ? "rounded-pill text-small bg-brand-700 px-3 py-1.5 font-bold text-white"
    : "rounded-pill text-small hover:bg-brand-100 text-ink-700 px-3 py-1.5 font-bold";
}

export type JournalFiltersProps = {
  kind: JournalKind | "all";
  period: JournalPeriod;
  onKind: (kind: JournalKind | "all") => void;
  onPeriod: (period: JournalPeriod) => void;
};

/** Filtres du journal — boutons au clavier avec état `aria-pressed`. */
export function JournalFilters({
  kind,
  period,
  onKind,
  onPeriod,
}: JournalFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filtrer par type"
        className="flex flex-wrap gap-1.5"
      >
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            aria-pressed={kind === k.value}
            onClick={() => onKind(k.value)}
            className={pill(kind === k.value)}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label="Filtrer par période"
        className="flex flex-wrap gap-1.5"
      >
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            aria-pressed={period === p.value}
            onClick={() => onPeriod(p.value)}
            className={pill(period === p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default JournalFilters;
