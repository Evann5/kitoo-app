/**
 * Journal unifié — agrégation **pure et testable** des trois sources (humeurs,
 * sessions d'exercices, résultats de tests) en une timeline chronologique.
 *
 * Aucune dépendance DB : la lecture (sous RLS) se fait dans `queries.ts`, puis
 * les lignes brutes sont projetées ici en `JournalEntry` (forme sérialisable,
 * primitives uniquement — passable à travers la frontière RSC).
 *
 * ⚠️ Confidentialité : le **score d'humeur 0–100 n'est jamais exposé** — une
 * entrée d'humeur ne porte que son libellé qualitatif (via `moodOption`).
 */

import { moodOption } from "@/features/mood/mood-config";
import {
  SCALES,
  isScaleKey,
  type ScaleKey,
  type SeverityTone,
} from "@/features/assessments/scales";

export type JournalKind = "mood" | "exercise" | "assessment";
export type JournalPeriod = "week" | "month" | "all";

type JournalBase = {
  id: string;
  /** Horodatage ISO précis (tri). */
  at: string;
  /** Date ISO "YYYY-MM-DD" (affichage). */
  date: string;
};

export type MoodJournalEntry = JournalBase & {
  kind: "mood";
  level: number;
  moodLabel: string;
  moodColor: string;
  tags: string[];
  commentExcerpt: string | null;
};

export type ExerciseJournalEntry = JournalBase & {
  kind: "exercise";
  title: string;
  category: string;
  durationSec: number;
  completed: boolean;
};

export type AssessmentJournalEntry = JournalBase & {
  kind: "assessment";
  scale: ScaleKey;
  scaleTitle: string;
  score: number;
  maxScore: number;
  severityLabel: string;
  severityTone: SeverityTone;
  flagged: boolean;
};

export type JournalEntry =
  | MoodJournalEntry
  | ExerciseJournalEntry
  | AssessmentJournalEntry;

const COMMENT_EXCERPT_MAX = 140;

function excerpt(comment: string | null | undefined): string | null {
  const trimmed = (comment ?? "").trim();
  if (!trimmed) return null;
  return trimmed.length > COMMENT_EXCERPT_MAX
    ? `${trimmed.slice(0, COMMENT_EXCERPT_MAX).trimEnd()}…`
    : trimmed;
}

// ── Projections lignes brutes → entrées de journal ────────────────────────

export type MoodRow = {
  id: string;
  entry_date: string;
  level: number;
  comment: string | null;
  created_at: string;
  tags?: string[];
};

/** Projette une humeur — **sans jamais exposer le score 0–100**. */
export function moodRowToEntry(row: MoodRow): MoodJournalEntry {
  const option = moodOption(row.level);
  return {
    kind: "mood",
    id: row.id,
    at: row.created_at,
    date: row.entry_date,
    level: row.level,
    moodLabel: option?.label ?? "Humeur",
    moodColor: option?.color ?? "var(--brand-300)",
    tags: row.tags ?? [],
    commentExcerpt: excerpt(row.comment),
  };
}

export type ExerciseRow = {
  id: string;
  started_at: string;
  completed: boolean;
  duration_sec: number;
  title: string;
  category: string;
};

export function exerciseRowToEntry(row: ExerciseRow): ExerciseJournalEntry {
  return {
    kind: "exercise",
    id: row.id,
    at: row.started_at,
    date: row.started_at.slice(0, 10),
    title: row.title,
    category: row.category,
    durationSec: row.duration_sec,
    completed: row.completed,
  };
}

export type AssessmentRow = {
  id: string;
  scale: string;
  score: number;
  taken_at: string;
  flagged: boolean;
};

/**
 * Projette un résultat de test. La sévérité (libellé + ton) est **recalculée**
 * depuis le score officiel via la définition de l'échelle — résultat assumé,
 * formulé en orientation (jamais « diagnostic »).
 */
export function assessmentRowToEntry(
  row: AssessmentRow,
): AssessmentJournalEntry | null {
  if (!isScaleKey(row.scale)) return null;
  const def = SCALES[row.scale];
  const severity = def.severityOf(row.score);
  return {
    kind: "assessment",
    id: row.id,
    at: row.taken_at,
    date: row.taken_at.slice(0, 10),
    scale: row.scale,
    scaleTitle: def.title,
    score: row.score,
    maxScore: def.maxScore,
    severityLabel: severity.label,
    severityTone: severity.tone,
    flagged: row.flagged,
  };
}

// ── Fusion, filtre, pagination ────────────────────────────────────────────

/** Fusionne plusieurs sources et trie du plus récent au plus ancien. */
export function mergeAndSort(...lists: JournalEntry[][]): JournalEntry[] {
  return lists.flat().sort((a, b) => b.at.localeCompare(a.at));
}

const PERIOD_DAYS: Record<Exclude<JournalPeriod, "all">, number> = {
  week: 7,
  month: 30,
};

/** Filtre par type et par période (fenêtre glissante depuis `nowIso`). */
export function filterEntries(
  entries: JournalEntry[],
  filters: { kind: JournalKind | "all"; period: JournalPeriod },
  nowIso: string,
): JournalEntry[] {
  let cutoff: number | null = null;
  if (filters.period !== "all") {
    const now = new Date(nowIso).getTime();
    cutoff = now - PERIOD_DAYS[filters.period] * 24 * 3600 * 1000;
  }
  return entries.filter((e) => {
    if (filters.kind !== "all" && e.kind !== filters.kind) return false;
    if (cutoff !== null && new Date(e.at).getTime() < cutoff) return false;
    return true;
  });
}

/** Page progressive : `count` premières entrées + indicateur de surplus. */
export function paginate(
  entries: JournalEntry[],
  count: number,
): { items: JournalEntry[]; hasMore: boolean } {
  return { items: entries.slice(0, count), hasMore: entries.length > count };
}

// ── Aperçu d'évolution ─────────────────────────────────────────────────────

/** Points d'humeur (date + niveau) pour le graphe — sans score. */
export function toMoodPoints(
  entries: JournalEntry[],
): { entry_date: string; level: number }[] {
  return entries
    .filter((e): e is MoodJournalEntry => e.kind === "mood")
    .map((e) => ({ entry_date: e.date, level: e.level }));
}

export type ExerciseRecap = { count: number; totalMinutes: number };

/** Récapitulatif d'exercices (factuel, encourageant) sur les entrées données. */
export function exerciseRecap(entries: JournalEntry[]): ExerciseRecap {
  const sessions = entries.filter(
    (e): e is ExerciseJournalEntry => e.kind === "exercise",
  );
  const totalSec = sessions.reduce((s, e) => s + (e.durationSec || 0), 0);
  return { count: sessions.length, totalMinutes: Math.round(totalSec / 60) };
}

export type AssessmentTrend = {
  scale: ScaleKey;
  scaleTitle: string;
  latest: AssessmentJournalEntry;
  /** Variation du score officiel vs la passation précédente (null si 1re). */
  delta: number | null;
};

/**
 * Pour chaque échelle passée au moins une fois : la dernière passation et la
 * variation du score officiel par rapport à la précédente (évolution assumée).
 */
export function assessmentTrends(entries: JournalEntry[]): AssessmentTrend[] {
  const byScale = new Map<ScaleKey, AssessmentJournalEntry[]>();
  for (const e of entries) {
    if (e.kind !== "assessment") continue;
    const list = byScale.get(e.scale) ?? [];
    list.push(e);
    byScale.set(e.scale, list);
  }
  const trends: AssessmentTrend[] = [];
  for (const [scale, list] of byScale) {
    // `list` suit l'ordre des entrées (récent → ancien) si déjà trié.
    const sorted = [...list].sort((a, b) => b.at.localeCompare(a.at));
    const latest = sorted[0];
    const previous = sorted[1];
    trends.push({
      scale,
      scaleTitle: latest.scaleTitle,
      latest,
      delta: previous ? latest.score - previous.score : null,
    });
  }
  return trends;
}
