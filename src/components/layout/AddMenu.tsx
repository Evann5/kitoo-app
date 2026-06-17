"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Smile, ClipboardList, Sparkles, type LucideIcon } from "lucide-react";

type Action = { href: string; label: string; icon: LucideIcon };

const ACTIONS: Action[] = [
  { href: "/humeur", label: "Noter mon humeur", icon: Smile },
  { href: "/tests", label: "Passer un test", icon: ClipboardList },
  { href: "/exercices", label: "Faire un exercice", icon: Sparkles },
];

export type AddMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Élément à refocaliser à la fermeture (le bouton « + »). */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Feuille d'actions rapides ouverte par le « + ». Modale accessible :
 * `role="dialog"` + `aria-modal`, **focus piégé** (Tab cyclique), fermeture par
 * Échap et clic extérieur, **retour du focus** au « + » à la fermeture.
 * Animation d'ouverture neutralisée sous `prefers-reduced-motion`.
 */
export function AddMenu({ open, onClose, returnFocusRef }: AddMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // Déclencheur capturé à l'ouverture (stable) pour le retour de focus.
    const trigger = returnFocusRef.current;
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Rendre le focus au « + » à la fermeture.
      trigger?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Voile cliquable. */}
      <div
        className="bg-ink-900/30 motion-safe:animate-enter absolute inset-0"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Actions rapides"
        onClick={(e) => e.stopPropagation()}
        className="rounded-panel max-w-content motion-safe:animate-enter relative z-10 mb-24 w-full bg-white p-4 shadow-md"
      >
        <p className="text-small text-ink-600 mb-2 text-center font-bold">
          Qu&apos;est-ce qu&apos;on fait ?
        </p>
        <ul className="flex flex-col gap-2">
          {ACTIONS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className="rounded-card hover:bg-brand-100 text-ink-900 flex min-h-[56px] items-center gap-3 px-4 py-3"
              >
                <span className="bg-brand-100 text-brand-700 rounded-pill flex h-10 w-10 shrink-0 items-center justify-center">
                  <Icon aria-hidden size={20} strokeWidth={1.8} />
                </span>
                <span className="text-body font-bold">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AddMenu;
