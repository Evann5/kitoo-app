import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listEntries, getTodayEntry } from "@/features/mood/queries";
import { poseForMood, moodOption } from "@/features/mood";
import { suggestResourcesForLevel } from "@/features/wellbeing/queries";
import { hasActiveConsent, ConsentGate } from "@/features/gdpr";
import {
  Greeting,
  StreakPill,
  CompanionCard,
  PrimaryMoodCta,
  SupportNudge,
  TodaySuggestion,
  computeStreak,
  shouldShowSupportNudge,
  getGreeting,
  addDays,
  type MoodPoint,
} from "@/features/dashboard";

export const metadata: Metadata = { title: "Accueil — Kitoo" };
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
  if (!(await hasActiveConsent())) {
    return (
      <AppShell>
        <ConsentGate />
      </AppShell>
    );
  }

  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const [{ data: profile }, entries, todayEntry] = await Promise.all([
    supabase
      .from("profiles")
      .select("prenom, companion_name")
      .eq("id", user.id)
      .maybeSingle(),
    listEntries(60),
    getTodayEntry(),
  ]);

  const points: MoodPoint[] = entries.map((e) => ({
    entry_date: e.entry_date,
    level: e.level,
  }));

  const streak = computeStreak(points, today);
  const showNudge = shouldShowSupportNudge(points, today);
  const hasToday = todayEntry !== null;

  // Ressenti **qualitatif** de la semaine (7 derniers jours) — jamais le score.
  const week = points.filter((p) => p.entry_date >= addDays(today, -6));
  const weekAvg = week.length
    ? Math.round(week.reduce((s, p) => s + p.level, 0) / week.length)
    : null;
  const weekLabel =
    weekAvg !== null ? (moodOption(weekAvg)?.label ?? null) : null;

  // Pose : reflète l'humeur du jour, sinon koala accueillant.
  const pose = hasToday ? poseForMood(todayEntry.level) : "classic";

  // Suggestion selon l'humeur du jour (sinon moyenne semaine, sinon neutre).
  const suggestLevel = todayEntry?.level ?? weekAvg ?? 3;
  const suggested =
    (await suggestResourcesForLevel(suggestLevel, 1))[0] ?? null;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* En-tête : salutation + date (gauche), pastille série (droite). */}
        <div className="flex items-start justify-between gap-3">
          <Greeting
            greeting={getGreeting(now.getHours())}
            name={profile?.prenom ?? null}
            dateLabel={dateFmt.format(now)}
          />
          <StreakPill streak={streak} />
        </div>

        <CompanionCard
          name={profile?.companion_name ?? "Kitoo"}
          message={companionMessage(todayEntry?.level ?? null)}
          pose={pose}
          streak={streak}
          weekLabel={weekLabel}
        />

        <PrimaryMoodCta hasToday={hasToday} />

        {showNudge ? <SupportNudge /> : null}

        <TodaySuggestion resource={suggested} />
      </div>
    </AppShell>
  );
}
