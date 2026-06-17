import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Suivi — Kitoo" };
export const dynamic = "force-dynamic";

export default async function SuiviPage() {
  await requireUser("/suivi");
  return (
    <AppShell>
      <ComingSoon
        title="Ton suivi"
        message="Bientôt, tu retrouveras ici l'historique détaillé de ton humeur et tes progrès, en douceur."
        pose="sleeping"
      />
    </AppShell>
  );
}
