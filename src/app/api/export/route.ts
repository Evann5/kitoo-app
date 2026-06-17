import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Droit d'accès / portabilité (RGPD) : exporte les données de l'utilisateur
 * connecté (profil + humeurs + tags + sessions d'exercices + résultats de
 * tests + consentements) en JSON ou CSV.
 *
 * Authentifié et soumis à la RLS : on ne renvoie que les données de l'appelant
 * (toutes les requêtes passent par sa session). Jamais de clé service_role.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Non authentifié", { status: 401 });
  }

  const [
    { data: profile },
    { data: entries },
    { data: sessions },
    { data: assessments },
    { data: chatMessages },
    { data: consents },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("mood_entries")
      .select(
        "entry_date, level, comment, created_at, mood_entry_tags(mood_tags(slug,label))",
      )
      .order("entry_date", { ascending: true }),
    supabase
      .from("exercise_sessions")
      .select(
        "started_at, completed_at, duration_sec, completed, exercises(slug, title, category)",
      )
      .order("started_at", { ascending: true }),
    supabase
      .from("assessment_results")
      .select("scale, score, severity, flagged, answers, taken_at")
      .order("taken_at", { ascending: true }),
    supabase
      .from("messages")
      .select("sender, content, flagged, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("consents")
      .select("type, granted_at, revoked_at")
      .order("granted_at", { ascending: true }),
  ]);

  type EntryRow = {
    entry_date: string;
    level: number;
    comment: string | null;
    created_at: string;
    mood_entry_tags: { mood_tags: { slug: string; label: string } | null }[];
  };
  const rows = (entries ?? []) as unknown as EntryRow[];

  type SessionRow = {
    started_at: string;
    completed_at: string | null;
    duration_sec: number;
    completed: boolean;
    exercises: { slug: string; title: string; category: string } | null;
  };
  const sessionRows = (sessions ?? []) as unknown as SessionRow[];

  const format = request.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const header = "date,niveau,commentaire,tags";
    const lines = rows.map((e) => {
      const tags = e.mood_entry_tags
        .map((t) => t.mood_tags?.slug)
        .filter(Boolean)
        .join("|");
      const comment = (e.comment ?? "").replace(/"/g, '""');
      return `${e.entry_date},${e.level},"${comment}","${tags}"`;
    });
    const csv = [header, ...lines].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kitoo-humeurs.csv"',
      },
    });
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile,
    mood_entries: rows.map((e) => ({
      entry_date: e.entry_date,
      level: e.level,
      comment: e.comment,
      created_at: e.created_at,
      tags: e.mood_entry_tags.map((t) => t.mood_tags?.slug).filter(Boolean),
    })),
    exercise_sessions: sessionRows.map((s) => ({
      started_at: s.started_at,
      completed_at: s.completed_at,
      duration_sec: s.duration_sec,
      completed: s.completed,
      exercise: s.exercises
        ? {
            slug: s.exercises.slug,
            title: s.exercises.title,
            category: s.exercises.category,
          }
        : null,
    })),
    assessment_results: assessments ?? [],
    chat_messages: chatMessages ?? [],
    consents,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitoo-donnees.json"',
    },
  });
}
