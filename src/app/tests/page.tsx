import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Tests — Kitoo" };
export const dynamic = "force-dynamic";

export default async function TestsPage() {
  await requireUser("/tests");
  return (
    <AppShell>
      <ComingSoon
        title="Les tests"
        message="Des petits questionnaires bienveillants pour mieux te connaître arrivent bientôt."
        pose="bubble-tea"
      />
    </AppShell>
  );
}
