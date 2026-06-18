import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/features/mood/queries";
import {
  ResourceCatalog,
  SuggestedResources,
  listResources,
  suggestByLevel,
} from "@/features/wellbeing";

export const metadata: Metadata = { title: "Bien-être - Kitoo" };
export const dynamic = "force-dynamic";

export default async function BienEtrePage() {
  await requireUser("/ressources");

  const [resources, recent] = await Promise.all([
    listResources(),
    listEntries(1),
  ]);

  // Suggestion d'après la dernière humeur saisie (si elle existe).
  const lastLevel = recent[0]?.level ?? null;
  const suggested =
    lastLevel !== null ? suggestByLevel(resources, lastLevel, 4) : [];

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">
            Espace bien-être
          </h1>
          <p className="text-body text-ink-600">
            Des ressources douces, validées par des professionnels, à ton
            rythme.
          </p>
        </header>

        <SuggestedResources resources={suggested} />
        <ResourceCatalog resources={resources} />
      </div>
    </AppShell>
  );
}
