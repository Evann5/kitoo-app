"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Heart, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { AddMenu } from "./AddMenu";

type Tab = { href: string; label: string; icon: LucideIcon };

// Accueil pointe vers le tableau de bord (la home de l'app connectée),
// pas la page marketing « / ». Ressources réutilise le catalogue bien-être.
const LEFT: Tab[] = [
  { href: "/tableau-de-bord", label: "Accueil", icon: Home },
  { href: "/suivi", label: "Suivi", icon: LineChart },
];
const RIGHT: Tab[] = [{ href: "/bien-etre", label: "Ressources", icon: Heart }];

export type TabBarProps = {
  /** Initiale affichée dans l'onglet Profil (avatar). */
  userInitial?: string;
};

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
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
 * Barre de navigation : Accueil · Suivi · [ + ] · Ressources · Profil.
 * Le « + » central (FAB) ouvre une feuille d'actions rapides (`AddMenu`).
 * Onglet actif marqué `aria-current="page"` ; cibles ≥ 44px.
 */
export function TabBar({ userInitial }: TabBarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const [menuOpen, setMenuOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const profilActive = isActive("/profil");

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="border-ink-200 fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur"
      >
        <ul className="max-w-content mx-auto flex items-stretch">
          {LEFT.map((tab) => (
            <li key={tab.href} className="flex flex-1">
              <TabLink tab={tab} active={isActive(tab.href)} />
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
              <TabLink tab={tab} active={isActive(tab.href)} />
            </li>
          ))}

          {/* Profil : avatar / initiale. */}
          <li className="flex flex-1">
            <Link
              href="/profil"
              aria-current={profilActive ? "page" : undefined}
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
                {userInitial ?? "?"}
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
