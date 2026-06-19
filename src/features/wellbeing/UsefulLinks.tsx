import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";
import type { Resource } from "./queries";
import { themeLabel } from "./filters";

export type UsefulLinksProps = {
  links: Resource[];
};

/**
 * Liens utiles (`format === "lien"`) regroupés par thème (écoute, information…).
 * Ressources **officielles externes** : ouvertes dans un nouvel onglet avec
 * `rel="noopener noreferrer"`. Ne rend rien si la liste est vide.
 *
 * Maintenance : ces URLs pointent vers des sites tiers ; les vérifier
 * régulièrement (cf. seed `20260619100100_seed_resources_hub.sql`).
 */
export function UsefulLinks({ links }: UsefulLinksProps) {
  if (links.length === 0) return null;

  const groups = new Map<string, Resource[]>();
  for (const link of links) {
    const list = groups.get(link.theme) ?? [];
    list.push(link);
    groups.set(link.theme, list);
  }

  return (
    <section aria-labelledby="links-title" className="flex flex-col gap-4">
      <h2 id="links-title" className="font-display text-title text-ink-900">
        Liens utiles
      </h2>
      <p className="text-small text-ink-600 -mt-2">
        Des ressources officielles, à consulter à ton rythme.
      </p>

      {Array.from(groups.entries()).map(([theme, items]) => (
        <div key={theme} className="flex flex-col gap-2">
          <h3 className="text-eyebrow text-ink-500 font-bold uppercase">
            {themeLabel(theme)}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-card block focus-visible:outline-none"
                >
                  <Card className="hover:bg-ink-50 flex h-full flex-col gap-1 transition-colors">
                    <span className="text-heading text-ink-900 inline-flex items-center gap-1.5">
                      {link.title}
                      <ExternalLink
                        aria-hidden
                        size={15}
                        strokeWidth={1.8}
                        className="text-brand-700"
                      />
                    </span>
                    <p className="text-body text-ink-600">{link.summary}</p>
                    {link.source ? (
                      <span className="text-small text-ink-500 mt-auto pt-1">
                        {link.source}
                      </span>
                    ) : null}
                  </Card>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default UsefulLinks;
