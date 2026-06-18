"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { JournalFilters } from "./JournalFilters";
import { JournalTimeline } from "./JournalTimeline";
import { TrendOverview } from "./TrendOverview";
import {
  filterEntries,
  paginate,
  type JournalEntry,
  type JournalKind,
  type JournalPeriod,
} from "./aggregate";

const PAGE_SIZE = 10;

export type JournalViewProps = {
  entries: JournalEntry[];
  /** Horodatage ISO de référence (fourni par le serveur). */
  nowIso: string;
};

/**
 * Vue du journal : aperçu d'évolution, filtres, timeline unifiée avec
 * chargement progressif. Ton encourageant et factuel, sans culpabilisation.
 */
export function JournalView({ entries, nowIso }: JournalViewProps) {
  const [kind, setKind] = useState<JournalKind | "all">("all");
  const [period, setPeriod] = useState<JournalPeriod>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => filterEntries(entries, { kind, period }, nowIso),
    [entries, kind, period, nowIso],
  );
  const { items, hasMore } = paginate(filtered, visible);

  function changeKind(next: JournalKind | "all") {
    setKind(next);
    setVisible(PAGE_SIZE);
  }
  function changePeriod(next: JournalPeriod) {
    setPeriod(next);
    setVisible(PAGE_SIZE);
  }

  // Aucune donnée : état vide global, chaleureux.
  if (entries.length === 0) {
    return (
      <Card soft className="flex flex-col items-center gap-3 text-center">
        <Mascot pose="sleeping" className="w-28" />
        <p className="text-body text-ink-900 font-bold">
          Ton journal se remplira au fil du temps.
        </p>
        <p className="text-body text-ink-700">
          Note ton humeur, fais un exercice ou passe un test - commence quand tu
          veux, à ton rythme.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button as="a" href="/humeur" variant="outline">
            Noter mon humeur
          </Button>
          <Button as="a" href="/exercices" variant="outline">
            Faire un exercice
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TrendOverview entries={entries} todayIso={nowIso.slice(0, 10)} />

      <section aria-labelledby="timeline-title" className="flex flex-col gap-4">
        <h2
          id="timeline-title"
          className="font-display text-title text-ink-900"
        >
          Ton parcours
        </h2>
        <JournalFilters
          kind={kind}
          period={period}
          onKind={changeKind}
          onPeriod={changePeriod}
        />

        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 text-center">
            <Mascot pose="classic" className="w-20" />
            <p className="text-body text-ink-700">
              Rien à afficher pour ce filtre. Essaie une autre période ou un
              autre type.
            </p>
          </Card>
        ) : (
          <>
            <JournalTimeline entries={items} />
            {hasMore ? (
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Voir plus
              </Button>
            ) : null}
          </>
        )}
      </section>

      <p className="text-small text-ink-600 text-center">
        Besoin de récupérer tes données ?{" "}
        <Link href="/profil" className="text-brand-700 font-bold">
          Exporte-les depuis ton profil
        </Link>
        .
      </p>
    </div>
  );
}

export default JournalView;
