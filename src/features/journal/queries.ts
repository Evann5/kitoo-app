import { createClient } from "@/lib/supabase/server";
import {
  assessmentRowToEntry,
  exerciseRowToEntry,
  mergeAndSort,
  moodRowToEntry,
  type JournalEntry,
} from "./aggregate";

/**
 * Lit les trois sources du journal (humeurs, exercices, tests) **sous RLS** -
 * chaque requête passe par la session de l'appelant, qui ne voit que ses
 * propres données. Les lignes sont projetées en `JournalEntry` (forme
 * sérialisable, sans le score d'humeur 0–100) puis fusionnées et triées.
 *
 * On lit une fenêtre généreuse par source (la pagination de la timeline est
 * progressive côté client) - suffisant pour un MVP, à raffiner si besoin.
 */
const SOURCE_LIMIT = 200;

type MoodSelectRow = {
  id: string;
  entry_date: string;
  level: number;
  comment: string | null;
  created_at: string;
  mood_entry_tags: { mood_tags: { label: string } | null }[];
};

type ExerciseSelectRow = {
  id: string;
  started_at: string;
  completed: boolean;
  duration_sec: number;
  exercises: { title: string; category: string } | null;
};

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = await createClient();

  const [moods, exercises, assessments] = await Promise.all([
    supabase
      .from("mood_entries")
      .select(
        "id, entry_date, level, comment, created_at, mood_entry_tags(mood_tags(label))",
      )
      .order("entry_date", { ascending: false })
      .limit(SOURCE_LIMIT),
    supabase
      .from("exercise_sessions")
      .select(
        "id, started_at, completed, duration_sec, exercises(title, category)",
      )
      .order("started_at", { ascending: false })
      .limit(SOURCE_LIMIT),
    supabase
      .from("assessment_results")
      .select("id, scale, score, flagged, taken_at")
      .order("taken_at", { ascending: false })
      .limit(SOURCE_LIMIT),
  ]);

  if (moods.error) throw moods.error;
  if (exercises.error) throw exercises.error;
  if (assessments.error) throw assessments.error;

  const moodEntries = ((moods.data ?? []) as unknown as MoodSelectRow[]).map(
    (r) =>
      moodRowToEntry({
        id: r.id,
        entry_date: r.entry_date,
        level: r.level,
        comment: r.comment,
        created_at: r.created_at,
        tags: r.mood_entry_tags
          .map((t) => t.mood_tags?.label)
          .filter((l): l is string => Boolean(l)),
      }),
  );

  const exerciseEntries = (
    (exercises.data ?? []) as unknown as ExerciseSelectRow[]
  ).map((r) =>
    exerciseRowToEntry({
      id: r.id,
      started_at: r.started_at,
      completed: r.completed,
      duration_sec: r.duration_sec,
      title: r.exercises?.title ?? "Exercice",
      category: r.exercises?.category ?? "",
    }),
  );

  const assessmentEntries = (assessments.data ?? [])
    .map(assessmentRowToEntry)
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return mergeAndSort(moodEntries, exerciseEntries, assessmentEntries);
}
