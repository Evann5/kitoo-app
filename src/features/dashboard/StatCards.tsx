import { Card } from "@/components/ui";
import type { MoodStats } from "./stats";

export type StatCardsProps = {
  stats: MoodStats;
  /** Période décrite par les stats (ex. « 30 derniers jours »). */
  periodLabel: string;
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 text-center">
      <span className="font-display text-title text-ink-900">{value}</span>
      <span className="text-small text-ink-600">{label}</span>
    </Card>
  );
}

/** Indicateurs synthétiques : humeur moyenne et nombre d'entrées. */
export function StatCards({ stats, periodLabel }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Stat
        value={stats.average !== null ? `${stats.average}/5` : "-"}
        label={`Humeur moyenne (${periodLabel})`}
      />
      <Stat value={String(stats.count)} label={`Entrées (${periodLabel})`} />
    </div>
  );
}

export default StatCards;
