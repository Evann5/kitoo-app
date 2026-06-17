import Link from "next/link";
import { ClipboardList, Sparkles, Wind, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";

export type QuickActionsProps = {
  /** Lien direct vers un exercice de respiration court (sinon le catalogue). */
  breathingHref: string;
};

type Action = { href: string; label: string; icon: LucideIcon };

/**
 * Accès rapides vers les activités clés. Cartes-raccourcis opérables au clavier
 * (liens), icônes Lucide cohérentes, cibles ≥ 44px.
 */
export function QuickActions({ breathingHref }: QuickActionsProps) {
  const actions: Action[] = [
    { href: "/exercices", label: "Faire un exercice", icon: Sparkles },
    { href: "/tests", label: "Passer un test", icon: ClipboardList },
    { href: breathingHref, label: "Respiration express", icon: Wind },
  ];

  return (
    <section aria-labelledby="quick-title" className="flex flex-col gap-3">
      <h2 id="quick-title" className="font-display text-title text-ink-900">
        Accès rapides
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="rounded-card focus-visible:outline-none"
            >
              <Card className="hover:bg-ink-50 flex h-full min-h-[88px] flex-col items-start justify-between gap-2 transition-colors">
                <span className="bg-brand-100 text-brand-700 rounded-pill flex h-10 w-10 items-center justify-center">
                  <Icon aria-hidden size={20} strokeWidth={1.8} />
                </span>
                <span className="text-body text-ink-900 font-bold">
                  {label}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default QuickActions;
