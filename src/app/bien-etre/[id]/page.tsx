import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { ResourceReader, getResource } from "@/features/wellbeing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResource(id);
  return {
    title: resource ? `${resource.title} — Kitoo` : "Ressource — Kitoo",
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("/bien-etre");
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  return (
    <AppShell width="prose">
      <ResourceReader resource={resource} />
    </AppShell>
  );
}
