"use server";

import { revalidatePath } from "next/cache";
import { upsertTodayEntry, setEntryTags } from "./queries";
import { isValidScore, scoreToLevel } from "./mood-config";

export type SaveMoodResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre (ou met à jour) l'humeur du jour de l'utilisateur connecté.
 *
 * Sécurité : exécutée côté serveur (jamais la clé service_role côté client).
 * La **date est calculée côté serveur** (`upsertTodayEntry` → `current_date`)
 * et l'`user_id` vient de la session - on ne fait pas confiance au client. La
 * RLS et la contrainte `unique (user_id, entry_date)` garantissent 1 entrée/jour
 * et l'isolation. On valide le **score** (entier 0–100) avant toute écriture ;
 * le `level` (1–5) en est dérivé.
 */
export async function saveMood(input: {
  score: number;
  comment: string;
  tagIds: string[];
}): Promise<SaveMoodResult> {
  // Validation serveur du score continu (caché) ; le niveau qualitatif en est
  // dérivé pour les stats/graphes.
  if (!isValidScore(input.score)) {
    return { ok: false, error: "Humeur invalide." };
  }
  const level = scoreToLevel(input.score);

  const comment = (input.comment ?? "").trim().slice(0, 1000) || null;
  const tagIds = Array.isArray(input.tagIds) ? input.tagIds.slice(0, 20) : [];

  try {
    const entry = await upsertTodayEntry({
      score: input.score,
      level,
      comment,
    });
    await setEntryTags(entry.id, tagIds);
    revalidatePath("/humeur");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Impossible d'enregistrer pour le moment. Réessaie dans un instant.",
    };
  }
}
