import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { SCALES, SCALE_ORDER } from "@/features/assessments";

export const metadata: Metadata = { title: "Tests — Kitoo" };
export const dynamic = "force-dynamic";

export default async function TestsPage() {
  await requireUser("/tests");

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">Tests</h1>
          <p className="text-body text-ink-700">
            Des questionnaires reconnus pour mieux te comprendre. Ils{" "}
            <strong>orientent</strong>, ils ne posent pas de diagnostic.
          </p>
          <p className="text-small text-ink-600">
            Kitoo ne remplace pas un suivi médical professionnel.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {SCALE_ORDER.map((key) => {
            const def = SCALES[key];
            return (
              <li key={key}>
                <Link
                  href={`/tests/${key}`}
                  className="rounded-card block focus-visible:outline-none"
                >
                  <Card className="hover:bg-ink-50 flex flex-col gap-1 transition-colors">
                    <h2 className="text-heading text-ink-900">{def.title}</h2>
                    <p className="text-body text-ink-600">{def.summary}</p>
                    <span className="text-small text-brand-700 font-bold">
                      Commencer →
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
