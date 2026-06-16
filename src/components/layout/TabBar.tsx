"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const stroke = (active: boolean) => (active ? "#6466CF" : "#7C7D90");

const ITEMS: Item[] = [
  {
    href: "/tableau-de-bord",
    label: "Accueil",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4 11.5 12 5l8 6.5M6 10v9h12v-9"
          stroke={stroke(a)}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/humeur",
    label: "Humeur",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke={stroke(a)} strokeWidth="1.8" />
        <path
          d="M9 14c.8.9 1.9 1.4 3 1.4s2.2-.5 3-1.4M9 10h.01M15 10h.01"
          stroke={stroke(a)}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/bien-etre",
    label: "Bien-être",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.7 12 20 12 20Z"
          stroke={stroke(a)}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <circle cx="12" cy="8.5" r="3.5" stroke={stroke(a)} strokeWidth="1.8" />
        <path
          d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
          stroke={stroke(a)}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/**
 * Barre d'onglets bas (mobile-first) : Accueil / Humeur / Bien-être / Profil.
 * `aria-current` sur l'onglet actif ; cibles ≥ 44px.
 */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="border-ink-200 fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur"
    >
      <ul className="max-w-content mx-auto flex items-stretch justify-around">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2",
                  "text-small font-bold",
                  active ? "text-brand-700" : "text-ink-500",
                )}
              >
                {item.icon(active)}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TabBar;
