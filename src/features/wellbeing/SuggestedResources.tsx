import { ResourceCard } from "./ResourceCard";
import type { Resource } from "./queries";

export type SuggestedResourcesProps = {
  resources: Resource[];
};

/**
 * Rangée « Suggéré pour toi » : ressources adaptées à la dernière humeur.
 * Ne rend rien si la liste est vide (la page masque alors la section).
 */
export function SuggestedResources({ resources }: SuggestedResourcesProps) {
  if (resources.length === 0) return null;
  return (
    <section aria-labelledby="suggested-title" className="flex flex-col gap-4">
      <h2 id="suggested-title" className="font-display text-title text-ink-900">
        Suggéré pour toi
      </h2>
      <p className="text-small text-ink-600 -mt-2">
        D&apos;après ton humeur récente — en douceur, à ton rythme.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => (
          <li key={resource.id}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SuggestedResources;
