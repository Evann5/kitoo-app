import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Play,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { Resource } from "./queries";
import { themeLabel, formatLabel } from "./filters";

const FORMAT_ICON: Record<string, LucideIcon> = {
  article: BookOpen,
  podcast: Headphones,
  video: Play,
};

const FORMAT_CTA: Record<string, string> = {
  article: "Lire",
  podcast: "Écouter",
  video: "Regarder",
};

export type ResourceCardProps = {
  resource: Resource;
};

/**
 * Carte d'une ressource (article / podcast / vidéo) : lien vers la vue de
 * lecture **interne**. Icône et badge adaptés au format, thème, durée ou temps
 * de lecture. Les « liens utiles » (`lien`) ne passent pas par cette carte
 * (cf. `UsefulLinks`).
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = FORMAT_ICON[resource.format] ?? BookOpen;
  const cta = FORMAT_CTA[resource.format] ?? "Ouvrir";
  const meta = resource.read_time ?? resource.duration;
  return (
    <Link
      href={`/ressources/${resource.id}`}
      className="rounded-card block focus-visible:outline-none"
    >
      <Card className="hover:bg-ink-50 flex h-full flex-col gap-2 transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
            <Icon aria-hidden size={18} strokeWidth={1.8} />
          </span>
          <Badge tone="brand">{formatLabel(resource.format)}</Badge>
          <Badge tone="neutral" className="capitalize">
            {themeLabel(resource.theme)}
          </Badge>
        </div>
        <h3 className="text-heading text-ink-900">{resource.title}</h3>
        <p className="text-body text-ink-600">{resource.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-small text-brand-700 font-bold">{cta} →</span>
          {meta ? (
            <span className="text-small text-ink-500 inline-flex items-center gap-1">
              <Clock aria-hidden size={14} strokeWidth={1.8} />
              {meta}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

export default ResourceCard;
