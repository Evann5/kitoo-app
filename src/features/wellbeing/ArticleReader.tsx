import Link from "next/link";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";
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

type Block =
  | { kind: "h2"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "p"; text: string };

/**
 * Parse le markdown-lite des articles (contenu **interne**, jamais sortant) :
 * `## ` → sous-titre, lignes `- ` consécutives → liste, paragraphes séparés par
 * une ligne vide. Pur et testable.
 */
export function parseArticle(content: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = content.trim().split(/\n{2,}/);
  for (const para of paragraphs) {
    const lines = para.split("\n");
    if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "list", items: lines.map((l) => l.slice(2)) });
    } else if (lines.length === 1 && lines[0].startsWith("## ")) {
      blocks.push({ kind: "h2", text: lines[0].slice(3) });
    } else {
      blocks.push({ kind: "p", text: para });
    }
  }
  return blocks;
}

export type ArticleReaderProps = {
  resource: Resource;
};

/**
 * Vue de lecture **interne** d'un article (aucun lien sortant). Rendu long-forme
 * (titres, listes, paragraphes), hiérarchie correcte (h1 → h2), mention de
 * validation pro + disclaimer Kitoo.
 */
export function ArticleReader({ resource }: ArticleReaderProps) {
  const pose = POSE_BY_THEME[resource.theme] ?? "classic";
  const blocks = parseArticle(resource.content ?? "");
  return (
    <article className="flex flex-col gap-5">
      <Link
        href="/ressources"
        className="text-small text-brand-700 inline-flex w-fit items-center gap-1 font-bold"
      >
        <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
        Retour à l&apos;espace ressources
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

      <div className="text-small text-ink-600 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck aria-hidden size={16} strokeWidth={1.8} />
          {resource.author_or_validation ??
            "Rédigé et validé par des professionnels de santé"}
        </span>
        {resource.read_time ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden size={16} strokeWidth={1.8} />
            {resource.read_time}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block, i) => {
          if (block.kind === "h2") {
            return (
              <h2
                key={i}
                className="font-display text-heading text-ink-900 mt-2"
              >
                {block.text}
              </h2>
            );
          }
          if (block.kind === "list") {
            return (
              <ul
                key={i}
                className="text-body text-ink-800 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-body text-ink-800 leading-relaxed">
              {block.text}
            </p>
          );
        })}
      </div>

      <p className="text-small border-ink-200 text-ink-600 mt-2 border-t pt-4">
        Kitoo ne remplace pas un suivi médical professionnel. Si tu traverses
        une période difficile, parles-en à un professionnel de santé.
      </p>
    </article>
  );
}

export default ArticleReader;
