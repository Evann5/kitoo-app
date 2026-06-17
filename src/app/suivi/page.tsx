import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { JournalView, getJournalEntries } from "@/features/journal";

export const metadata: Metadata = { title: "Suivi — Kitoo" };
export const dynamic = "force-dynamic";

export default async function SuiviPage() {
  await requireUser("/suivi");
  const entries = await getJournalEntries();
  const nowIso = new Date().toISOString();

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">Ton journal</h1>
          <p className="text-body text-ink-700">
            Voici ton parcours : humeurs, exercices et tests réunis au même
            endroit.
          </p>
        </header>
        <JournalView entries={entries} nowIso={nowIso} />
      </div>
    </AppShell>
  );
}
