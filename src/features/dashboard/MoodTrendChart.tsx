"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Card } from "@/components/ui";
import { moodOption } from "@/features/mood";
import type { SeriesPoint } from "./stats";

export type MoodTrendChartProps = {
  weekly: SeriesPoint[];
  monthly: SeriesPoint[];
};

type Period = "week" | "month";

const weekdayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const dayMonthFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Graphique d'évolution de l'humeur (hebdo / mensuel), barres colorées par
 * l'échelle d'humeur fixe. **Accessibilité** : le graphe SVG est `aria-hidden`,
 * doublé d'un résumé textuel et d'une table de données réservée aux lecteurs
 * d'écran. Animations neutralisées sous `prefers-reduced-motion`.
 */
export function MoodTrendChart({ weekly, monthly }: MoodTrendChartProps) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<Period>("week");
  const data = period === "week" ? weekly : monthly;

  const noted = useMemo(() => data.filter((d) => d.level !== null), [data]);
  const periodLabel =
    period === "week" ? "7 derniers jours" : "30 derniers jours";

  const summary =
    noted.length === 0
      ? `Aucune humeur notée sur les ${periodLabel}.`
      : `Évolution de ton humeur sur les ${periodLabel} : ${noted.length} jour(s) noté(s).`;

  return (
    <section aria-labelledby="trend-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="trend-title" className="font-display text-title text-ink-900">
          Tes tendances
        </h2>
        <div role="group" aria-label="Période" className="flex gap-1">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={
                period === p
                  ? "rounded-pill text-small bg-brand-700 px-3 py-1 font-bold text-white"
                  : "rounded-pill text-small hover:bg-brand-100 text-ink-700 px-3 py-1 font-bold"
              }
            >
              {p === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {/* Résumé textuel + table de données pour lecteurs d'écran. */}
        <p className="sr-only">{summary}</p>
        <table className="sr-only">
          <caption>Humeur par jour ({periodLabel})</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Humeur</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{dayMonthFmt.format(parseLocal(d.date))}</td>
                <td>
                  {d.level !== null
                    ? (moodOption(d.level)?.label ?? String(d.level))
                    : "Non noté"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {noted.length === 0 ? (
          <p className="text-body text-ink-500 py-8 text-center">
            Note ton humeur pour voir tes tendances apparaître ici.
          </p>
        ) : (
          <div aria-hidden className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 4, bottom: 4, left: -24 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(iso: string) =>
                    period === "week"
                      ? weekdayFmt.format(parseLocal(iso)).slice(0, 3)
                      : parseLocal(iso).getDate().toString()
                  }
                  interval={period === "week" ? 0 : 4}
                  tick={{ fontSize: 12, fill: "#7C7D90" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12, fill: "#7C7D90" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Bar
                  dataKey="level"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={!reduce}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.date}
                      fill={
                        d.level !== null
                          ? (moodOption(d.level)?.color ?? "var(--brand-300)")
                          : "transparent"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </section>
  );
}

export default MoodTrendChart;
