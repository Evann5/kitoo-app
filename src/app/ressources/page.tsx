import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/features/mood/queries";
import {
  ResourceCatalog,
  SuggestedResources,
  UsefulLinks,
  listResources,
  suggestByLevel,
} from "@/features/wellbeing";

export const metadata: Metadata = { title: "Ressources - Kitoo" };
export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  await requireUser("/ressources");

  const [resources, recent] = await Promise.all([
    listResources(),
    listEntries(1),
  ]);

  // Contenus à lire/écouter/regarder d'un côté, liens utiles de l'autre.
  const content = resources.filter((r) => r.format !== "lien");
  const links = resources.filter((r) => r.format === "lien");

  // Suggestion d'après la dernière humeur saisie (si elle existe).
  const lastLevel = recent[0]?.level ?? null;
  const suggested =
    lastLevel !== null ? suggestByLevel(content, lastLevel, 4) : [];

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">
            Espace ressources
          </h1>
          <p className="text-body text-ink-600">
            Des contenus doux à lire, écouter ou regarder, validés par des
            professionnels, à ton rythme.
          </p>
        </header>

        <SuggestedResources resources={suggested} />
        <ResourceCatalog resources={content} />
        <UsefulLinks links={links} />
      </div>
    </AppShell>
  );
}
