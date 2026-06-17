import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { Resource } from "@/features/wellbeing/queries";

export type TodaySuggestionProps = {
  resource: Resource | null;
};

/**
 * Section « Pour toi aujourd'hui » : un titre, un lien « Voir tout » vers
 * l'espace bien-être, et une ressource suggérée selon l'humeur récente (ou un
 * repli chaleureux). Le détail s'ouvre dans `/ressources`.
 */
export function TodaySuggestion({ resource }: TodaySuggestionProps) {
  return (
    <section aria-labelledby="suggestion-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="suggestion-title"
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

      {resource ? (
        <Link
          href="/ressources"
          className="rounded-card focus-visible:outline-none"
        >
          <Card className="hover:bg-ink-50 flex flex-col gap-2 transition-colors">
            <Badge tone="brand" className="self-start capitalize">
              {resource.type}
            </Badge>
            <h3 className="text-heading text-ink-900">{resource.title}</h3>
            <p className="text-body text-ink-600">{resource.summary}</p>
            <span className="text-small text-brand-700 font-bold">
              Découvrir →
            </span>
          </Card>
        </Link>
      ) : (
        <Card soft>
          <p className="text-body text-ink-700">
            Des ressources douces t&apos;attendent dans l&apos;espace bien-être.
          </p>
        </Card>
      )}
    </section>
  );
}

export default TodaySuggestion;
