import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import {
  ArticleReader,
  MediaResource,
  getResource,
} from "@/features/wellbeing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResource(id);
  return {
    title: resource ? `${resource.title} - Kitoo` : "Ressource - Kitoo",
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("/ressources");
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  // Les liens utiles sont externes : pas de page de lecture dédiée.
  if (resource.format === "lien") notFound();

  const isMedia = resource.format === "podcast" || resource.format === "video";

  return (
    <AppShell width="prose">
      {isMedia ? (
        <MediaResource resource={resource} />
      ) : (
        <ArticleReader resource={resource} />
      )}
    </AppShell>
  );
}
