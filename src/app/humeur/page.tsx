import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { MoodEntryForm, RecentMoods } from "@/features/mood";
import {
  getTodayEntry,
  getEntryTagIds,
  listEntries,
  listMoodTags,
} from "@/features/mood/queries";

export const metadata: Metadata = {
  title: "Mon humeur — Kitoo",
};

// Route privée : pas de cache statique (données par utilisateur).
export const dynamic = "force-dynamic";

export default async function HumeurPage() {
  await requireUser("/humeur");

  // Date du jour en UTC (cohérent avec `current_date` côté Postgres et avec
  // `getTodayEntry`), pour distinguer aujourd'hui des jours passés.
  const today = new Date().toISOString().slice(0, 10);

  const [tags, todayEntry, recent] = await Promise.all([
    listMoodTags(),
    getTodayEntry(),
    listEntries(14),
  ]);

  const initial = todayEntry
    ? {
        // `score` est back-fillé pour toute ligne existante ; fallback neutre.
        score: todayEntry.score ?? 50,
        comment: todayEntry.comment ?? "",
        tagIds: await getEntryTagIds(todayEntry.id),
      }
    : null;

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        <MoodEntryForm tags={tags} initial={initial} today={today} />
        <RecentMoods entries={recent} today={today} />
      </div>
    </AppShell>
  );
}
