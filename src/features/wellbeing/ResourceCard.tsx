import Link from "next/link";
import { BookOpen, Lightbulb, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { Resource } from "./queries";
import { themeLabel } from "./filters";

const TYPE_ICON: Record<string, LucideIcon> = {
  article: BookOpen,
  exercice: Sparkles,
  conseil: Lightbulb,
};

export type ResourceCardProps = {
  resource: Resource;
};

/**
 * Carte d'une ressource bien-être (lien vers la vue de lecture interne).
 * Icône de type cohérente (Lucide, outline), thème en badge, résumé.
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = TYPE_ICON[resource.type] ?? BookOpen;
  return (
    <Link
      href={`/ressources/${resource.id}`}
      className="rounded-card block focus-visible:outline-none"
    >
      <Card className="hover:bg-ink-50 flex h-full flex-col gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
            <Icon aria-hidden size={18} strokeWidth={1.8} />
          </span>
          <Badge tone="neutral" className="capitalize">
            {themeLabel(resource.theme)}
          </Badge>
        </div>
        <h3 className="text-heading text-ink-900">{resource.title}</h3>
        <p className="text-body text-ink-600">{resource.summary}</p>
        <span className="text-small text-brand-700 mt-auto font-bold">
          Lire →
        </span>
      </Card>
    </Link>
  );
}

export default ResourceCard;
