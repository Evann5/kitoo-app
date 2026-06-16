import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listEntries, getTodayEntry } from "@/features/mood/queries";
import { poseForMood } from "@/features/mood";
import { suggestResourcesForLevel } from "@/features/wellbeing/queries";
import {
  Greeting,
  StreakBadge,
  CompanionCard,
  StatCards,
  MoodTrendChart,
  SupportNudge,
  SuggestedResource,
  buildDailySeries,
  computeStats,
  computeStreak,
  shouldShowSupportNudge,
  getGreeting,
  moodCtaLabel,
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
    return "Comment tu te sens aujourd'hui ? Prends un instant pour toi.";
  }
  if (todayLevel >= 4) return "Ravi de te voir en forme — savoure ce moment.";
  if (todayLevel === 3)
    return "Merci d'avoir pris ce temps pour toi aujourd'hui.";
  return "Je suis là, prends soin de toi. Un jour à la fois.";
}

export default async function DashboardPage() {
  const user = await requireUser("/tableau-de-bord");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const [{ data: profile }, entries, todayEntry] = await Promise.all([
    supabase.from("profiles").select("prenom").eq("id", user.id).maybeSingle(),
    listEntries(60),
    getTodayEntry(),
  ]);

  const points: MoodPoint[] = entries.map((e) => ({
    entry_date: e.entry_date,
    level: e.level,
  }));

  // Stats sur les 30 derniers jours ; série sur tout l'historique chargé.
  const since30 = addDays(today, -29);
  const stats = {
    ...computeStats(
      points.filter((p) => p.entry_date >= since30),
      today,
    ),
    streak: computeStreak(points, today),
  };

  const weekly = buildDailySeries(points, today, 7);
  const monthly = buildDailySeries(points, today, 30);
  const showNudge = shouldShowSupportNudge(points, today);

  const hasToday = todayEntry !== null;
  const pose = poseForMood(todayEntry?.level ?? 3);
  const isEmpty = points.length === 0;

  // Ressource suggérée selon l'humeur du jour (sinon moyenne, sinon neutre).
  const suggestLevel = todayEntry?.level ?? Math.round(stats.average ?? 3);
  const suggested =
    (await suggestResourcesForLevel(suggestLevel, 1))[0] ?? null;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Greeting
          greeting={getGreeting(now.getHours())}
          name={profile?.prenom ?? null}
          dateLabel={dateFmt.format(now)}
        />

        <CompanionCard
          pose={pose}
          message={companionMessage(todayEntry?.level ?? null)}
        />

        <Button as="a" href="/humeur" size="lg" fullWidth>
          {moodCtaLabel(hasToday)}
        </Button>

        {showNudge ? <SupportNudge /> : null}

        {isEmpty ? (
          <p className="text-body rounded-card bg-brand-50 text-ink-600 px-4 py-6 text-center">
            Commence par noter ton humeur — c&apos;est quand tu veux, sans
            pression. Tes tendances apparaîtront ici au fil des jours.
          </p>
        ) : (
          <>
            <StreakBadge streak={stats.streak} />
            <StatCards stats={stats} periodLabel="30 derniers jours" />
            <MoodTrendChart weekly={weekly} monthly={monthly} />
          </>
        )}

        <SuggestedResource resource={suggested} />
      </div>
    </AppShell>
  );
}
