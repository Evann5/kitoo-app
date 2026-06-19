import Link from "next/link";
import { ArrowLeft, ExternalLink, Clock, Headphones, Play } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Resource } from "./queries";
import { themeLabel, formatLabel } from "./filters";

export type MediaResourceProps = {
  resource: Resource;
};

/**
 * Vue d'un média (podcast / vidéo). Si un `media_embed` (URL d'intégration) est
 * fourni, on l'affiche en lecteur intégré ; sinon on propose un lien externe
 * **sécurisé** (`rel="noopener noreferrer"`, `target="_blank"`). Source, durée
 * et description affichées. Aucune redirection automatique.
 */
export function MediaResource({ resource }: MediaResourceProps) {
  const isVideo = resource.format === "video";
  const Icon = isVideo ? Play : Headphones;
  const url = resource.url ?? null;
  const embed = resource.media_embed ?? null;

  return (
    <article className="flex flex-col gap-5">
      <Link
        href="/ressources"
        className="text-small text-brand-700 inline-flex w-fit items-center gap-1 font-bold"
      >
        <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
        Retour à l&apos;espace ressources
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
          <Icon aria-hidden size={18} strokeWidth={1.8} />
        </span>
        <Badge tone="brand">{formatLabel(resource.format)}</Badge>
        <Badge tone="neutral" className="capitalize">
          {themeLabel(resource.theme)}
        </Badge>
      </div>

      <h1 className="font-display text-display text-ink-900">
        {resource.title}
      </h1>

      <div className="text-small text-ink-600 flex flex-wrap items-center gap-x-4 gap-y-1">
        {resource.source ? <span>{resource.source}</span> : null}
        {resource.duration ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden size={16} strokeWidth={1.8} />
            {resource.duration}
          </span>
        ) : null}
      </div>

      <p className="text-body text-ink-800 leading-relaxed">
        {resource.summary}
      </p>

      {embed ? (
        <div className="rounded-card bg-ink-900 aspect-video w-full overflow-hidden">
          <iframe
            src={embed}
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-700 shadow-brand hover:bg-brand-800 rounded-pill inline-flex w-fit items-center gap-2 px-5 py-3 font-bold text-white"
        >
          {isVideo ? "Regarder" : "Écouter"} sur {resource.source ?? "le site"}
          <ExternalLink aria-hidden size={18} strokeWidth={1.8} />
        </a>
      ) : null}

      <p className="text-small border-ink-200 text-ink-600 mt-2 border-t pt-4">
        Ce contenu est hébergé sur un site externe. Kitoo ne remplace pas un
        suivi médical professionnel.
      </p>
    </article>
  );
}

export default MediaResource;
