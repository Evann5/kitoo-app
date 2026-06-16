import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import type { MascotPose } from "@/lib/illustrations";
import type { Resource } from "./queries";
import { themeLabel } from "./filters";

const POSE_BY_THEME: Record<string, MascotPose> = {
  sommeil: "sleeping",
  confiance: "sunglasses",
  relations: "heart",
  stress: "soda",
};

export type ResourceReaderProps = {
  resource: Resource;
};

/**
 * Vue de lecture **interne** d'une ressource (aucun lien sortant). Texte long
 * en largeur de prose (~680px via `Container width="prose"` côté page),
 * hiérarchie de titres correcte (h1), mention de validation pro + disclaimer.
 */
export function ResourceReader({ resource }: ResourceReaderProps) {
  const pose = POSE_BY_THEME[resource.theme] ?? "classic";
  return (
    <article className="flex flex-col gap-5">
      <Link
        href="/bien-etre"
        className="text-small text-brand-700 inline-flex w-fit items-center gap-1 font-bold"
      >
        <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
        Retour à l&apos;espace bien-être
      </Link>

      <div className="flex items-center gap-3">
        <Mascot pose={pose} className="w-16 shrink-0" />
        <Badge tone="brand" className="capitalize">
          {themeLabel(resource.theme)}
        </Badge>
      </div>

      <h1 className="font-display text-display text-ink-900">
        {resource.title}
      </h1>

      <p className="text-small text-ink-500 inline-flex items-center gap-1.5">
        <ShieldCheck aria-hidden size={16} strokeWidth={1.8} />
        Rédigé et validé par des professionnels de santé
      </p>

      {/* Contenu : paragraphes préservés (corps ≥ 16px). */}
      <div className="text-body text-ink-800 leading-relaxed whitespace-pre-line">
        {resource.content}
      </div>

      <p className="text-small border-ink-200 text-ink-500 mt-2 border-t pt-4">
        Kitoo ne remplace pas un suivi médical professionnel. Si tu traverses
        une période difficile, parles-en à un professionnel de santé.
      </p>
    </article>
  );
}

export default ResourceReader;
