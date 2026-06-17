/**
 * Helpers **purs et testables** des modules d'accueil enrichis (A20) : récap
 * doux de la semaine et mot du jour. Aucune dépendance DB ; on opère sur des
 * données déjà lues (sous RLS) dans la page. **Jamais le score 0–100 caché** —
 * uniquement des niveaux qualitatifs (1–5) et des comptes.
 */

import { addDays, type MoodPoint } from "./stats";

export type WeeklyRecap = {
  /** Jours notés sur les 7 derniers jours (distincts). */
  daysNoted: number;
  /** Sessions d'exercices sur les 7 derniers jours. */
  exercises: number;
  /** Niveau ressenti moyen de la semaine (1–5), arrondi, ou null si rien. */
  feelingLevel: number | null;
};

/**
 * Récap qualitatif des 7 derniers jours : jours d'humeur notés, exercices faits,
 * et niveau ressenti moyen (arrondi). Factuel et encourageant, jamais punitif.
 */
export function buildWeeklyRecap(
  points: MoodPoint[],
  exerciseDates: string[],
  today: string,
): WeeklyRecap {
  const since = addDays(today, -6);
  const weekPoints = points.filter((p) => p.entry_date >= since);
  const daysNoted = new Set(weekPoints.map((p) => p.entry_date)).size;
  const exercises = exerciseDates.filter((d) => d.slice(0, 10) >= since).length;
  const feelingLevel = weekPoints.length
    ? Math.round(
        weekPoints.reduce((s, p) => s + p.level, 0) / weekPoints.length,
      )
    : null;
  return { daysNoted, exercises, feelingLevel };
}

/** Vrai si la semaine ne contient encore aucune donnée (état vide). */
export function isRecapEmpty(recap: WeeklyRecap): boolean {
  return recap.daysNoted === 0 && recap.exercises === 0;
}

/** Phrases d'encouragement de Kitoo (ton doux, jamais culpabilisant). */
export const ENCOURAGEMENTS: readonly string[] = [
  "Prendre soin de toi, c'est déjà beaucoup. Un pas à la fois.",
  "Tu fais de ton mieux, et c'est suffisant aujourd'hui.",
  "Chaque petit moment pour toi compte. Sois doux·ce avec toi-même.",
  "Respire. Tu as le droit d'avancer à ton rythme.",
  "Il n'y a pas de bonne ou mauvaise humeur — juste la tienne, accueillie.",
  "Un jour difficile n'efface pas tes progrès. Tu es sur le chemin.",
  "Merci d'être là pour toi aujourd'hui. C'est précieux.",
];

/** Mot du jour, choisi de façon stable selon l'index passé (jour du mois…). */
export function encouragementOfDay(dayIndex: number): string {
  const i =
    ((Math.trunc(dayIndex) % ENCOURAGEMENTS.length) + ENCOURAGEMENTS.length) %
    ENCOURAGEMENTS.length;
  return ENCOURAGEMENTS[i];
}
