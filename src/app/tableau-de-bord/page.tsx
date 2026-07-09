import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { HideTabBar } from "@/components/layout/HideTabBar";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listEntries, getTodayEntry } from "@/features/mood/queries";
import { poseForMood, moodOption } from "@/features/mood";
import { suggestResourcesForLevel } from "@/features/wellbeing/queries";
import { getDailyInspiration } from "@/lib/daily-inspiration";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import {
  listExercises,
  listMySessions,
  suggestExercisesForLevel,
} from "@/features/exercises/queries";
import { hasActiveConsent, ConsentGate } from "@/features/gdpr";
import {
  Greeting,
  StreakPill,
  CompanionCard,
  PrimaryMoodCta,
  SupportNudge,
  DailyInspiration,
  WeekOverview,
  QuickActions,
  SuggestionsList,
  WeeklyRecap,
  DailyEncouragement,
  computeStreak,
  shouldShowSupportNudge,
  getGreeting,
  buildDailySeries,
  buildWeeklyRecap,
  encouragementOfDay,
  resolveDisplayName,
  type MoodPoint,
  type Suggestion,
} from "@/features/dashboard";

export const metadata: Metadata = { title: "Accueil - Kitoo" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Message chaleureux de la bulle du compagnon, selon l'humeur du jour. */
function companionMessage(todayLevel: number | null): string {
  if (todayLevel === null) {
    return "Salut ! Tu n'as pas encore noté ton humeur aujourd'hui.";
  }
  if (todayLevel >= 4) return "Content de te revoir 🌱 Savoure ce moment.";
  if (todayLevel === 3)
    return "Merci d'avoir pris ce temps pour toi aujourd'hui.";
  return "Je suis là, prends soin de toi. Un jour à la fois.";
}

export default async function DashboardPage() {
  const user = await requireUser("/tableau-de-bord");

  // Consentement RGPD requis avant tout usage : sinon, écran de consentement.
  // `HideTabBar` masque la barre tant que l'onboarding est à l'écran - elle
  // n'apparaît qu'une fois dans l'app.
  if (!(await hasActiveConsent())) {
    return (
      <AppShell>
        <HideTabBar />
        <ConsentGate />
      </AppShell>
    );
  }

  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const [{ data: profile }, entries, todayEntry, sessions, respirations] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("prenom, companion_name")
        .eq("id", user.id)
        .maybeSingle(),
      listEntries(60),
      getTodayEntry(),
      listMySessions(30),
      listExercises("respiration"),
    ]);

  const points: MoodPoint[] = entries.map((e) => ({
    entry_date: e.entry_date,
    level: e.level,
  }));

  const streak = computeStreak(points, today);
  const showNudge = shouldShowSupportNudge(points, today);
  const hasToday = todayEntry !== null;

  // Aperçu de la semaine (7 derniers jours) - couleur/libellé, jamais le score.
  const weekDays = buildDailySeries(points, today, 7);

  // Ressenti **qualitatif** de la semaine + récap doux.
  const recap = buildWeeklyRecap(
    points,
    sessions.map((s) => s.started_at),
    today,
  );
  const weekLabel =
    recap.feelingLevel !== null
      ? (moodOption(recap.feelingLevel)?.label ?? null)
      : null;

  // Pose : reflète l'humeur du jour, sinon koala accueillant.
  const pose = hasToday ? poseForMood(todayEntry.level) : "classic";

  // Respiration express : l'exercice de respiration le plus court.
  const breathing = [...respirations].sort(
    (a, b) => a.duration_sec - b.duration_sec,
  )[0];
  const breathingHref = breathing
    ? `/exercices/${breathing.slug}`
    : "/exercices";

  // Suggestions élargies (mix ressources + exercices) selon l'humeur récente.
  const level = todayEntry?.level ?? recap.feelingLevel ?? 3;
  const [resources, exercises] = await Promise.all([
    suggestResourcesForLevel(level, 2),
    suggestExercisesForLevel(level, 1),
  ]);
  const suggestions: Suggestion[] = [
    ...resources.map((r) => ({
      key: `r-${r.id}`,
      badge: r.type,
      title: r.title,
      summary: r.summary,
      href: `/ressources/${r.id}`,
    })),
    ...exercises.map((e) => ({
      key: `e-${e.id}`,
      badge: e.category,
      title: e.title,
      summary: e.description,
      href: `/exercices/${e.slug}`,
    })),
  ].slice(0, 3);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* En-tête : salutation + date (gauche), pastille série (droite). */}
        <div className="flex items-start justify-between gap-3">
          <Greeting
            greeting={getGreeting(now.getHours())}
            name={resolveDisplayName(profile?.prenom ?? null, user.email)}
            dateLabel={dateFmt.format(now)}
          />
          <StreakPill streak={streak} />
        </div>

        <DailyInspiration {...getDailyInspiration(now)} />

        <CompanionCard
          name={profile?.companion_name ?? "Kitoo"}
          message={companionMessage(todayEntry?.level ?? null)}
          pose={pose}
          streak={streak}
          weekLabel={weekLabel}
        />

        <PrimaryMoodCta hasToday={hasToday} />

        {showNudge ? <SupportNudge /> : null}

        {/* Accès rapide à l'aide d'urgence (soutenant, non anxiogène). */}
        <Link
          href="/urgence"
          className="rounded-card border-brand-200 bg-brand-50 hover:bg-brand-100 flex items-center gap-3 border px-4 py-3 focus-visible:outline-none"
        >
          <span className="bg-brand-100 text-brand-700 rounded-pill flex h-10 w-10 shrink-0 items-center justify-center">
            <LifeBuoy aria-hidden size={20} strokeWidth={1.8} />
          </span>
          <span className="flex flex-col">
            <span className="text-body text-ink-900 font-bold">
              Besoin d&apos;aide maintenant ?
            </span>
            <span className="text-small text-ink-600">
              Numéros d&apos;écoute et d&apos;urgence, à portée de main.
            </span>
          </span>
        </Link>

        <WeekOverview days={weekDays} />
        <QuickActions breathingHref={breathingHref} />
        <SuggestionsList suggestions={suggestions} />
        <WeeklyRecap recap={recap} feelingLabel={weekLabel} />
        <DailyEncouragement message={encouragementOfDay(now.getDate())} />
      </div>
    </AppShell>
  );
}
