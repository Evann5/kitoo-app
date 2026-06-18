"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Heart, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AddMenu } from "./AddMenu";

type Tab = { href: string; label: string; icon: LucideIcon };

// Accueil pointe vers le tableau de bord (la home de l'app connectée),
// pas la page marketing « / ». Ressources réutilise le catalogue bien-être.
const LEFT: Tab[] = [
  { href: "/tableau-de-bord", label: "Accueil", icon: Home },
  { href: "/suivi", label: "Suivi", icon: LineChart },
];
const RIGHT: Tab[] = [
  { href: "/ressources", label: "Ressources", icon: Heart },
];

// Routes de l'app connectée où la barre s'affiche (rendue persistante dans le
// layout racine → ne se démonte plus à la navigation, d'où le glissement fluide
// de la lentille). Hors de ces routes (marketing, auth, légales) : masquée.
const APP_PREFIXES = [
  "/tableau-de-bord",
  "/suivi",
  "/humeur",
  "/ressources",
  "/tests",
  "/exercices",
  "/chat",
  "/profil",
];

// Créneaux (5) : Accueil · Suivi · [+] · Ressources · Profil. Sert à positionner
// la lentille de verre. `null` = créneau du FAB (jamais actif).
const SLOTS: (string | null)[] = [
  "/tableau-de-bord",
  "/suivi",
  null,
  "/ressources",
  "/profil",
];

export type TabBarProps = {
  /** Initiale affichée dans l'onglet Profil (sinon récupérée côté client). */
  userInitial?: string;
};

function TabLink({
  tab,
  active,
  onActivate,
}: {
  tab: Tab;
  active: boolean;
  onActivate: () => void;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      onClick={onActivate}
      className={cn(
        "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2",
        "text-small font-bold",
        active ? "text-brand-700" : "text-ink-600",
      )}
    >
      <Icon aria-hidden size={24} strokeWidth={active ? 2.2 : 1.8} />
      <span>{tab.label}</span>
    </Link>
  );
}

/**
 * Barre de navigation **flottante** (glassmorphism) : Accueil · Suivi · [ + ] ·
 * Ressources · Profil. Rendue **une seule fois** dans le layout racine pour
 * rester montée à travers les navigations → la **lentille de verre glisse** vers
 * l'onglet actif. Retour visuel **optimiste** au clic (la lentille bouge
 * immédiatement, sans attendre le chargement serveur). `aria-current="page"` sur
 * l'onglet actif ; cibles ≥ 44px ; lentille décorative neutralisée sous
 * `prefers-reduced-motion`.
 */
export function TabBar({ userInitial }: TabBarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const [menuOpen, setMenuOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Initiale de l'avatar : fournie en prop, sinon récupérée côté client (garde
  // le layout racine statique pour les pages publiques).
  const [initial, setInitial] = useState(userInitial);
  useEffect(() => {
    if (userInitial || !isSupabaseConfigured()) return;
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const letter = data.user?.email?.[0]?.toUpperCase();
        if (active && letter) setInitial(letter);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userInitial]);

  // Lentille : retour optimiste au clic (la lentille glisse tout de suite),
  // réconcilié pendant le rendu une fois la nouvelle route validée — `from`
  // mémorise la route au moment du clic.
  const computedIndex = SLOTS.findIndex((h) => h !== null && isActive(h));
  const [optimistic, setOptimistic] = useState<{
    idx: number;
    from: string;
  } | null>(null);
  let activeIndex = computedIndex;
  if (optimistic) {
    if (optimistic.from === pathname) activeIndex = optimistic.idx;
    else setOptimistic(null); // route validée → on revient au calcul réel
  }
  const activate = (idx: number) => setOptimistic({ idx, from: pathname });

  const show = APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!show) return null;

  const profilActive = isActive("/profil");

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className={cn(
          "fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2",
          // Glassmorphism : surface translucide + flou d'arrière-plan + bord clair.
          "rounded-[28px] border border-white/50 bg-white/70 backdrop-blur-xl",
          "shadow-[0_10px_30px_rgba(22,22,29,0.15)] [@supports(backdrop-filter:blur(0))]:bg-white/55",
        )}
      >
        {/* Lentille de verre : glisse vers l'onglet actif au changement de page. */}
        <span
          aria-hidden
          className="ease-kitoo pointer-events-none absolute inset-y-1.5 left-0 z-0 w-1/5 transition-[transform,opacity] duration-500 motion-reduce:transition-none"
          style={{
            transform: `translateX(${activeIndex < 0 ? 0 : activeIndex * 100}%)`,
            opacity: activeIndex < 0 ? 0 : 1,
          }}
        >
          <span className="mx-1.5 block h-full rounded-[22px] border border-white/70 bg-white/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_2px_8px_rgba(22,22,29,0.12)] backdrop-blur-md" />
        </span>

        <ul className="relative z-10 flex items-stretch">
          {LEFT.map((tab, i) => (
            <li key={tab.href} className="flex flex-1">
              <TabLink
                tab={tab}
                active={isActive(tab.href)}
                onActivate={() => activate(i)}
              />
            </li>
          ))}

          {/* FAB central « + ». */}
          <li className="flex flex-1 items-center justify-center">
            <button
              ref={fabRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-label="Actions rapides"
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "bg-brand-700 shadow-brand rounded-pill -mt-6 flex h-14 w-14 items-center justify-center text-white",
                "duration-kitoo ease-kitoo hover:bg-brand-800 transition-transform",
                "motion-safe:active:scale-[0.94]",
              )}
            >
              <Plus aria-hidden size={26} strokeWidth={2.4} />
            </button>
          </li>

          {RIGHT.map((tab) => (
            <li key={tab.href} className="flex flex-1">
              <TabLink
                tab={tab}
                active={isActive(tab.href)}
                onActivate={() => activate(3)}
              />
            </li>
          ))}

          {/* Profil : avatar / initiale. */}
          <li className="flex flex-1">
            <Link
              href="/profil"
              aria-current={profilActive ? "page" : undefined}
              onClick={() => activate(4)}
              className={cn(
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2",
                "text-small font-bold",
                profilActive ? "text-brand-700" : "text-ink-600",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "rounded-pill flex h-6 w-6 items-center justify-center text-[13px] font-bold",
                  profilActive
                    ? "bg-brand-700 text-white"
                    : "bg-ink-200 text-ink-700",
                )}
              >
                {initial ?? "?"}
              </span>
              <span>Profil</span>
            </Link>
          </li>
        </ul>
      </nav>

      <AddMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusRef={fabRef}
      />
    </>
  );
}

export default TabBar;
