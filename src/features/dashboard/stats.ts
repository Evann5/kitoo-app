/**
 * Calculs du tableau de bord - fonctions **pures et testables**, opérant sur des
 * entrées d'humeur normalisées (`{ entry_date: "YYYY-MM-DD", level: 1..5 }`).
 * Aucune dépendance DB : la lecture (sous RLS) se fait dans la page via les
 * helpers A3, puis on passe les données ici.
 *
 * Les dates sont manipulées en UTC (cohérent avec `current_date` Postgres et
 * `getTodayEntry`), via des chaînes "YYYY-MM-DD".
 */

export type MoodPoint = { entry_date: string; level: number };

/** Décale une date "YYYY-MM-DD" de `delta` jours (UTC). */
export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function levelByDate(entries: MoodPoint[]): Map<string, number> {
  return new Map(entries.map((e) => [e.entry_date, e.level]));
}

/**
 * Série de saisie : nombre de jours **consécutifs** avec une entrée, en
 * remontant depuis aujourd'hui. Si rien n'est noté aujourd'hui mais que la
 * veille l'est, la série n'est pas (encore) cassée : on compte depuis hier.
 * Renvoie 0 si ni aujourd'hui ni hier n'ont d'entrée.
 */
export function computeStreak(entries: MoodPoint[], today: string): number {
  const dates = new Set(entries.map((e) => e.entry_date));
  let cursor = dates.has(today) ? today : addDays(today, -1);
  if (!dates.has(cursor)) return 0;
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Nombre de jours « très négatif » (niveau 1) consécutifs les plus récents,
 * ancrés sur aujourd'hui ou hier (sinon 0 - on ne déclenche pas sur des données
 * anciennes). Sert à l'alerte de soutien.
 */
export function trailingVeryNegativeCount(
  entries: MoodPoint[],
  today: string,
): number {
  const byDate = levelByDate(entries);
  let cursor = byDate.has(today)
    ? today
    : byDate.has(addDays(today, -1))
      ? addDays(today, -1)
      : null;
  if (!cursor) return 0;
  let count = 0;
  while (byDate.get(cursor) === 1) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

/** Seuil d'alerte : 3 jours « très négatif » consécutifs. */
export const SUPPORT_NUDGE_THRESHOLD = 3;

/** Faut-il afficher l'invitation douce à parler à un professionnel ? */
export function shouldShowSupportNudge(
  entries: MoodPoint[],
  today: string,
): boolean {
  return trailingVeryNegativeCount(entries, today) >= SUPPORT_NUDGE_THRESHOLD;
}

export type MoodStats = {
  count: number;
  /** Humeur moyenne (1–5) arrondie à 1 décimale, ou null si aucune entrée. */
  average: number | null;
  streak: number;
};

export function computeStats(entries: MoodPoint[], today: string): MoodStats {
  const count = entries.length;
  const average =
    count === 0
      ? null
      : Math.round((entries.reduce((s, e) => s + e.level, 0) / count) * 10) /
        10;
  return { count, average, streak: computeStreak(entries, today) };
}

export type SeriesPoint = { date: string; level: number | null };

/**
 * Série quotidienne sur les `days` derniers jours (du plus ancien au plus
 * récent), `level = null` pour les jours sans saisie (trous lisibles au graphe).
 */
export function buildDailySeries(
  entries: MoodPoint[],
  today: string,
  days: number,
): SeriesPoint[] {
  const byDate = levelByDate(entries);
  const series: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    series.push({ date, level: byDate.get(date) ?? null });
  }
  return series;
}

/** Libellé du CTA principal selon l'existence d'une entrée aujourd'hui. */
export function moodCtaLabel(hasToday: boolean): string {
  return hasToday ? "Modifier mon humeur" : "Noter mon humeur";
}

/** Salutation contextuelle selon l'heure (0–23). */
export function getGreeting(hour: number): string {
  if (hour < 6) return "Bonne nuit";
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}
