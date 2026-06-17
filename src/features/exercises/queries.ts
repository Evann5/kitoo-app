import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Exercise = Tables<"exercises">;
export type ExerciseSession = Tables<"exercise_sessions">;

/** Catalogue des exercices (lecture seule, RLS authentifié). */
export async function listExercises(category?: string): Promise<Exercise[]> {
  const supabase = await createClient();
  let query = supabase.from("exercises").select("*").order("title");
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Un exercice par slug, ou `null`. */
export async function getExerciseBySlug(
  slug: string,
): Promise<Exercise | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Suggère des exercices adaptés à un niveau d'humeur (1–5) via le tableau
 * `mood_levels` (`contains`). Lecture seule, RLS authentifié.
 */
export async function suggestExercisesForLevel(
  level: number,
  limit = 2,
): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .contains("mood_levels", [level])
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Sessions récentes de l'utilisateur (historique, A14). */
export async function listMySessions(limit = 30): Promise<ExerciseSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercise_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
