"use client";

import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui";
import { MoodTrendChart } from "@/features/dashboard/MoodTrendChart";
import { buildDailySeries } from "@/features/dashboard/stats";
import {
  assessmentTrends,
  exerciseRecap,
  toMoodPoints,
  type JournalEntry,
} from "./aggregate";

export type TrendOverviewProps = {
  entries: JournalEntry[];
  /** "YYYY-MM-DD" — ancrage des séries (fourni par le serveur). */
  todayIso: string;
};

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="text-small text-ink-600">1re passation</span>;
  }
  if (delta === 0) {
    return (
      <span className="text-small text-ink-600 inline-flex items-center gap-1">
        <Minus aria-hidden size={14} strokeWidth={2} /> stable
      </span>
    );
  }
  const up = delta > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="text-small text-ink-700 inline-flex items-center gap-1">
      <Icon aria-hidden size={14} strokeWidth={2} />
      {up ? "+" : ""}
      {delta}{" "}
      <span className="sr-only">points par rapport à la fois précédente</span>
    </span>
  );
}

/**
 * Aperçu d'évolution : courbe d'humeur (qualitative, jamais le score 0–100),
 * récap d'exercices et évolution des scores de tests (résultat assumé). Tous
 * les visuels ont une alternative textuelle (cf. `MoodTrendChart`).
 */
export function TrendOverview({ entries, todayIso }: TrendOverviewProps) {
  const points = toMoodPoints(entries);
  const weekly = buildDailySeries(points, todayIso, 7);
  const monthly = buildDailySeries(points, todayIso, 30);
  const recap = exerciseRecap(entries);
  const trends = assessmentTrends(entries);

  return (
    <section aria-labelledby="evolution-title" className="flex flex-col gap-4">
      <h2 id="evolution-title" className="font-display text-title text-ink-900">
        Ton évolution
      </h2>

      <MoodTrendChart weekly={weekly} monthly={monthly} />

      {recap.count > 0 ? (
        <Card className="flex items-center gap-3">
          <span className="bg-brand-100 text-brand-700 rounded-pill flex h-10 w-10 shrink-0 items-center justify-center">
            <Activity aria-hidden size={20} strokeWidth={1.8} />
          </span>
          <p className="text-body text-ink-800">
            <strong>{recap.count}</strong> exercice
            {recap.count > 1 ? "s" : ""}
            {recap.totalMinutes > 0 ? ` · ${recap.totalMinutes} min` : ""} pour
            prendre soin de toi. Continue à ton rythme.
          </p>
        </Card>
      ) : null}

      {trends.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-heading text-ink-900">Tes tests dans le temps</h3>
          <ul className="flex flex-col gap-2">
            {trends.map((t) => (
              <li key={t.scale}>
                <Card className="flex items-center gap-2">
                  <span className="text-body text-ink-900 font-bold">
                    {t.scaleTitle}
                  </span>
                  <span className="text-small text-ink-600">
                    {t.latest.severityLabel} · {t.latest.score}/
                    {t.latest.maxScore}
                  </span>
                  <span className="ml-auto">
                    <DeltaPill delta={t.delta} />
                  </span>
                </Card>
              </li>
            ))}
          </ul>
          <p className="text-small text-ink-600">
            Ces résultats orientent, ils ne posent pas de diagnostic. Kitoo ne
            remplace pas un suivi médical professionnel.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default TrendOverview;
