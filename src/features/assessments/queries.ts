import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type AssessmentResultRow = Tables<"assessment_results">;

/**
 * Résultats de tests de l'utilisateur (historique, A14). Lecture sous RLS :
 * chacun ne voit que les siens.
 */
export async function listMyAssessments(
  limit = 50,
): Promise<AssessmentResultRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessment_results")
    .select("*")
    .order("taken_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
