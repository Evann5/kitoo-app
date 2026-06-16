import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/features/auth";

/**
 * Callback d'authentification : échange le `code` reçu (confirmation email /
 * lien magique) contre une session, puis redirige vers la destination interne.
 *
 * Inutile quand la confirmation email est désactivée (la session est créée
 * directement à l'inscription), mais conservé pour gérer les deux cas.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = safeRedirect(searchParams.get("redirect") ?? undefined);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Code absent/invalide → retour connexion avec un indicateur d'erreur.
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
