"use client";

import { useMemo, useState } from "react";
import { ResourceCard } from "./ResourceCard";
import { ThemeFilter } from "./ThemeFilter";
import { filterResources, resourceThemes, resourceTypes } from "./filters";
import type { Resource } from "./queries";

export type ResourceCatalogProps = {
  resources: Resource[];
};

/**
 * Catalogue filtrable (thème + type cumulables). Liste sémantique de
 * `ResourceCard` ; état « aucun résultat » doux.
 */
export function ResourceCatalog({ resources }: ResourceCatalogProps) {
  const [theme, setTheme] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const themes = useMemo(() => resourceThemes(resources), [resources]);
  const types = useMemo(() => resourceTypes(resources), [resources]);
  const filtered = useMemo(
    () => filterResources(resources, { theme, type }),
    [resources, theme, type],
  );

  return (
    <section aria-labelledby="catalog-title" className="flex flex-col gap-4">
      <h2 id="catalog-title" className="font-display text-title text-ink-900">
        Explorer
      </h2>

      <ThemeFilter
        themes={themes}
        types={types}
        theme={theme}
        type={type}
        onThemeChange={setTheme}
        onTypeChange={setType}
      />

      {filtered.length === 0 ? (
        <p className="text-body rounded-card bg-brand-50 text-ink-600 px-4 py-6 text-center">
          Rien ici pour ce filtre, essaie un autre thème.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((resource) => (
            <li key={resource.id}>
              <ResourceCard resource={resource} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ResourceCatalog;
