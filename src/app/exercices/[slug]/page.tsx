import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { ExercisePlayer, getExerciseBySlug } from "@/features/exercises";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getExerciseBySlug(slug);
  return { title: exercise ? `${exercise.title} — Kitoo` : "Exercice — Kitoo" };
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser("/exercices");
  const { slug } = await params;
  const exercise = await getExerciseBySlug(slug);
  if (!exercise) notFound();

  return (
    <AppShell width="prose">
      <div className="flex flex-col gap-6">
        <Link
          href="/exercices"
          className="text-small text-brand-700 inline-flex w-fit items-center gap-1 font-bold"
        >
          <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
          Retour aux exercices
        </Link>
        <header className="flex flex-col gap-1 text-center">
          <h1 className="font-display text-title text-ink-900">
            {exercise.title}
          </h1>
          <p className="text-body text-ink-600">{exercise.description}</p>
        </header>
        <ExercisePlayer exercise={exercise} />
      </div>
    </AppShell>
  );
}
