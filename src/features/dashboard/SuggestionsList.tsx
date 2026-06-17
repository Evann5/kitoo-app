import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export type Suggestion = {
  /** Clé unique (id ressource ou slug exercice). */
  key: string;
  /** Étiquette de type (ex. « article », « respiration »). */
  badge: string;
  title: string;
  summary: string;
  /** Destination (`/ressources/[id]` ou `/exercices/[slug]`). */
  href: string;
};

export type SuggestionsListProps = {
  suggestions: Suggestion[];
};

/**
 * « Pour toi aujourd'hui » : 2–3 suggestions (mix ressources + exercices) selon
 * l'humeur récente, en liste. Lien « Voir tout » vers l'espace bien-être. État
 * vide chaleureux.
 */
export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  return (
    <section
      aria-labelledby="suggestions-title"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="suggestions-title"
          className="font-display text-title text-ink-900"
        >
          Pour toi aujourd&apos;hui
        </h2>
        <Link
          href="/ressources"
          className="text-small text-brand-700 shrink-0 font-bold"
        >
          Voir tout
        </Link>
      </div>

      {suggestions.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <li key={s.key}>
              <Link
                href={s.href}
                className="rounded-card focus-visible:outline-none"
              >
                <Card className="hover:bg-ink-50 flex flex-col gap-2 transition-colors">
                  <Badge tone="brand" className="self-start capitalize">
                    {s.badge}
                  </Badge>
                  <h3 className="text-heading text-ink-900">{s.title}</h3>
                  <p className="text-body text-ink-600">{s.summary}</p>
                  <span className="text-small text-brand-700 font-bold">
                    Découvrir →
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Card soft>
          <p className="text-body text-ink-700">
            Des ressources et exercices doux t&apos;attendent dans l&apos;espace
            bien-être.
          </p>
        </Card>
      )}
    </section>
  );
}

export default SuggestionsList;
