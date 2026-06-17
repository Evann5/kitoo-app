import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { AssessmentRunner, SCALES, isScaleKey } from "@/features/assessments";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scale: string }>;
}): Promise<Metadata> {
  const { scale } = await params;
  const title = isScaleKey(scale) ? SCALES[scale].title : "Test";
  return { title: `${title} — Kitoo` };
}

export default async function ScalePage({
  params,
}: {
  params: Promise<{ scale: string }>;
}) {
  await requireUser("/tests");
  const { scale } = await params;
  if (!isScaleKey(scale)) notFound();

  return (
    <AppShell width="prose">
      <AssessmentRunner scaleKey={scale} />
    </AppShell>
  );
}
