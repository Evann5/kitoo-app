import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Exercices — Kitoo" };
export const dynamic = "force-dynamic";

export default async function ExercicesPage() {
  await requireUser("/exercices");
  return (
    <AppShell>
      <ComingSoon
        title="Les exercices"
        message="Respiration, ancrage, gratitude… des exercices guidés pour prendre soin de toi seront bientôt là."
        pose="soda"
      />
    </AppShell>
  );
}
