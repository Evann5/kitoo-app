import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Préfixes de routes privées : accès réservé aux personnes connectées. */
const PROTECTED_PREFIXES = [
  "/profil",
  "/tableau-de-bord",
  "/humeur",
  "/ressources",
  "/suivi",
  "/tests",
  "/exercices",
  "/chat",
];

/** Routes d'auth : une personne déjà connectée n'a rien à y faire. */
const AUTH_ROUTES = ["/connexion", "/inscription"];

/**
 * Rafraîchit la session Supabase à chaque requête (rotation des tokens via
 * cookies) ET protège les routes.
 *
 * Pattern `@supabase/ssr` : on lit/écrit les cookies sur la requête ET la
 * réponse, et l'on appelle `getUser()` (qui revalide le token côté Supabase)
 * immédiatement après la création du client — aucune logique entre les deux,
 * sous peine de déconnexions aléatoires.
 *
 * Sans variables d'env Supabase, on laisse simplement passer la requête
 * (le client est tolérant ; utile pour les builds/preview non configurés).
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return supabaseResponse;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof supabaseResponse.cookies.set>[2];
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT : ne rien insérer entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Non connecté sur une route privée → vers /connexion (avec retour).
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/connexion";
    redirectUrl.searchParams.set("redirect", pathname);
    return copyCookies(NextResponse.redirect(redirectUrl), supabaseResponse);
  }

  // Déjà connecté sur une route d'auth → vers le tableau de bord.
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/tableau-de-bord";
    redirectUrl.search = "";
    return copyCookies(NextResponse.redirect(redirectUrl), supabaseResponse);
  }

  return supabaseResponse;
}

/** Recopie les cookies de session sur une réponse de redirection. */
function copyCookies(target: NextResponse, source: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  return target;
}
