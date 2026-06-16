import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Resource = Tables<"resources">;

/**
 * Helpers d'accès aux ressources bien-être (server-only). Les ressources sont
 * en lecture seule pour tout utilisateur authentifié (RLS).
 */

/** Toutes les ressources, optionnellement filtrées par thème. */
export async function listResources(theme?: string): Promise<Resource[]> {
  const supabase = await createClient();
  let query = supabase.from("resources").select("*").order("created_at");
  if (theme) query = query.eq("theme", theme);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Une ressource par id, ou `null`. */
export async function getResource(id: string): Promise<Resource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Suggère des ressources adaptées à un niveau d'humeur (1–5), via le tableau
 * `mood_levels` de chaque ressource (`contains`).
 */
export async function suggestResourcesForLevel(
  level: number,
  limit = 3,
): Promise<Resource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .contains("mood_levels", [level])
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
