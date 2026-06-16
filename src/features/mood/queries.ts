import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/types";

export type MoodEntry = Tables<"mood_entries">;
export type MoodTag = Tables<"mood_tags">;

/** Niveau d'humeur valide (1 = très négatif … 5 = très positif). */
export type MoodLevelValue = 1 | 2 | 3 | 4 | 5;

/**
 * Helpers d'accès aux données du Mood Tracker (server-only — `createClient`
 * lit les cookies de session). La RLS garantit qu'un utilisateur ne touche que
 * ses propres lignes ; on renseigne quand même `user_id = auth.uid()` côté
 * insert (exigé par la policy `with check`).
 */

/** Liste des tags d'humeur prédéfinis (lecture seule). */
export async function listMoodTags(): Promise<MoodTag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mood_tags")
    .select("*")
    .order("label");
  if (error) throw error;
  return data ?? [];
}

/** Entrée d'humeur du jour pour l'utilisateur courant, ou `null`. */
export async function getTodayEntry(): Promise<MoodEntry | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("entry_date", today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Dernières entrées d'humeur (les plus récentes d'abord). */
export async function listEntries(limit = 30): Promise<MoodEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Crée ou met à jour l'entrée d'humeur du jour (1 par jour, contrainte
 * `unique (user_id, entry_date)`) via upsert sur ce couple.
 */
export async function upsertTodayEntry(input: {
  level: MoodLevelValue;
  comment?: string | null;
}): Promise<MoodEntry> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const today = new Date().toISOString().slice(0, 10);
  const payload: TablesInsert<"mood_entries"> = {
    user_id: user.id,
    entry_date: today,
    level: input.level,
    comment: input.comment ?? null,
  };
  const { data, error } = await supabase
    .from("mood_entries")
    .upsert(payload, { onConflict: "user_id,entry_date" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Remplace l'ensemble des tags associés à une entrée d'humeur. */
export async function setEntryTags(
  moodEntryId: string,
  tagIds: string[],
): Promise<void> {
  const supabase = await createClient();
  // On efface les liaisons existantes puis on recrée (RLS limite déjà au
  // propriétaire de l'entrée).
  const { error: delError } = await supabase
    .from("mood_entry_tags")
    .delete()
    .eq("mood_entry_id", moodEntryId);
  if (delError) throw delError;

  if (tagIds.length === 0) return;
  const rows: TablesInsert<"mood_entry_tags">[] = tagIds.map((tag_id) => ({
    mood_entry_id: moodEntryId,
    tag_id,
  }));
  const { error: insError } = await supabase
    .from("mood_entry_tags")
    .insert(rows);
  if (insError) throw insError;
}
