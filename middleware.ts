import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Next : rafraîchit la session Supabase et protège les routes
 * privées (cf. `updateSession`).
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Exécuté sur toutes les routes SAUF les assets statiques et l'optimiseur
   * d'images (pour ne pas rafraîchir la session inutilement).
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|otf|woff2?)$).*)",
  ],
};
