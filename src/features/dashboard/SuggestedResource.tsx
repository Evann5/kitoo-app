import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { Resource } from "@/features/wellbeing/queries";

export type SuggestedResourceProps = {
  resource: Resource | null;
};

/**
 * Bloc « Pour toi aujourd'hui » : suggère une ressource bien-être adaptée à
 * l'humeur récente. Lien vers l'espace bien-être (A6).
 */
export function SuggestedResource({ resource }: SuggestedResourceProps) {
  return (
    <section aria-labelledby="suggestion-title" className="flex flex-col gap-3">
      <h2
        id="suggestion-title"
        className="font-display text-title text-ink-900"
      >
        Pour toi aujourd&apos;hui
      </h2>
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

export default SuggestedResource;
