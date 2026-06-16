"use server";

import { revalidatePath } from "next/cache";
import { upsertTodayEntry, setEntryTags } from "./queries";
import { isValidMoodValue } from "./mood-config";

export type SaveMoodResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre (ou met à jour) l'humeur du jour de l'utilisateur connecté.
 *
 * Sécurité : exécutée côté serveur (jamais la clé service_role côté client).
 * La **date est calculée côté serveur** (`upsertTodayEntry` → `current_date`)
 * et l'`user_id` vient de la session — on ne fait pas confiance au client. La
 * RLS et la contrainte `unique (user_id, entry_date)` garantissent 1 entrée/jour
 * et l'isolation. On valide le niveau (entier 1–5) avant toute écriture.
 */
export async function saveMood(input: {
  level: number;
  comment: string;
  tagIds: string[];
}): Promise<SaveMoodResult> {
  if (!isValidMoodValue(input.level)) {
    return { ok: false, error: "Niveau d'humeur invalide." };
  }

  const comment = (input.comment ?? "").trim().slice(0, 1000) || null;
  const tagIds = Array.isArray(input.tagIds) ? input.tagIds.slice(0, 20) : [];

  try {
    const entry = await upsertTodayEntry({ level: input.level, comment });
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
