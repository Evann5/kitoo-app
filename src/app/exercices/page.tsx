import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { ExerciseCatalog, listExercises } from "@/features/exercises";

export const metadata: Metadata = { title: "Exercices — Kitoo" };
export const dynamic = "force-dynamic";

export default async function ExercicesPage() {
  await requireUser("/exercices");
  const exercises = await listExercises();

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">Exercices</h1>
          <p className="text-body text-ink-600">
            Des moments guidés pour souffler, t&apos;ancrer et te détendre — à
            ton rythme.
          </p>
        </header>
        <ExerciseCatalog exercises={exercises} />
      </div>
    </AppShell>
  );
}
