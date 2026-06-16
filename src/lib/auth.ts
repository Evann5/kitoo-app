import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Récupère l'utilisateur connecté côté serveur (Server Components, actions).
 *
 * Utilise `getUser()` (et non `getSession()`) : le token est revalidé auprès de
 * Supabase à chaque appel, ce qui est la méthode sûre pour décider d'un accès.
 * Renvoie `null` si personne n'est connecté (ou si Supabase n'est pas configuré).
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Exige une session pour une page privée : renvoie l'utilisateur, ou redirige
 * vers `/connexion` (le middleware fait déjà ce filtrage, ceci est une seconde
 * barrière au niveau de la page).
 *
 * @param redirectTo chemin de retour après connexion.
 */
export async function requireUser(redirectTo = "/profil"): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(`/connexion?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
