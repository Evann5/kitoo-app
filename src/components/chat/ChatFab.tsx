"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleHeart } from "lucide-react";

// Routes où le FAB de chat s'affiche. Exclues (par demande produit) : Profil,
// Exercices (+slug), Tests (+scale), Humeur - et tout le reste (auth, légales…).
const SHOW_PREFIXES = ["/tableau-de-bord", "/suivi", "/ressources", "/urgence"];

/**
 * Bouton flottant (FAB) **collant** d'accès au chat de soutien, en bas à droite,
 * au-dessus de la tab bar et des safe-areas. Rendu une fois dans le layout
 * racine ; il se masque hors des routes autorisées (et sur `/chat`). Accessible
 * (`aria-label`, cible ≥ 44px) ; apparition douce neutralisée sous
 * `prefers-reduced-motion`.
 */
export function ChatFab() {
  const pathname = usePathname();
  const show = SHOW_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!show) return null;

  return (
    <Link
      href="/chat"
      aria-label="Ouvrir l'échange de soutien"
      data-chat-fab
      className="bg-brand-700 shadow-brand hover:bg-brand-800 motion-safe:animate-enter fixed right-4 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full text-white motion-safe:active:scale-95"
      style={{ bottom: "max(6rem, calc(env(safe-area-inset-bottom) + 6rem))" }}
    >
      <MessageCircleHeart aria-hidden size={26} strokeWidth={2} />
    </Link>
  );
}

export default ChatFab;
