"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Déconnexion : invalide la session Supabase (efface les cookies) puis renvoie
 * vers l'écran de connexion. Utilisée comme `action` d'un `<form>`.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
