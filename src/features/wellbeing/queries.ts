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
// Format UUID v4 attendu pour un id de ressource — évite une erreur SQL
// (« invalid input syntax for uuid ») sur un id arbitraire dans l'URL.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getResource(id: string): Promise<Resource | null> {
  if (!UUID_RE.test(id)) return null;
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
