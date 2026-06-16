import Image from "next/image";
import { illustrationAssetExists } from "@/lib/illustration-assets";
import {
  illustrations,
  illustrationSrc,
  type IllustrationKey,
} from "@/lib/illustrations";
import { cn } from "@/lib/cn";
import {
  BlobPlaceholder,
  KoalaPlaceholder,
  WaveDividerPlaceholder,
} from "./placeholders/Placeholders";

export type IllustrationProps = {
  /** Clé du registre (jamais un chemin en dur). */
  name: IllustrationKey;
  className?: string;
  /**
   * Force le caractère décoratif (`aria-hidden`, `alt=""`). Par défaut, déduit
   * du registre (alt vide ⇒ décoratif).
   */
  decorative?: boolean;
  /** Chargement prioritaire (hero) : `eager` au lieu de `lazy`. @default false */
  priority?: boolean;
};

function PlaceholderFor({
  name,
  className,
}: {
  name: IllustrationKey;
  className?: string;
}) {
  const { width, height } = illustrations[name];
  const props = { label: name, width, height, className };
  if (name === "blob-soft") return <BlobPlaceholder {...props} />;
  if (name === "wave-divider") return <WaveDividerPlaceholder {...props} />;
  return <KoalaPlaceholder {...props} />;
}

/**
 * Rend une illustration **par clé** : résout l'asset final déposé dans
 * `public/illustrations/` s'il existe (au build), sinon un placeholder doux et
 * cohérent avec le design system. Dimensions définies (anti-CLS), `lazy` par
 * défaut, `alt`/`aria-hidden` selon le sens.
 *
 * @example
 * <Illustration name="koala-calm" className="w-48" />
 */
export function Illustration({
  name,
  className,
  decorative,
  priority = false,
}: IllustrationProps) {
  const meta = illustrations[name];
  const isDecorative = decorative ?? meta.alt === "";

  if (illustrationAssetExists(meta.file)) {
    // Asset réel (raster) optimisé par next/image (WebP/AVIF, lazy hors hero),
    // dimensions intrinsèques fixées (anti-CLS).
    return (
      <Image
        src={illustrationSrc(name)}
        alt={isDecorative ? "" : meta.alt}
        aria-hidden={isDecorative || undefined}
        width={meta.width}
        height={meta.height}
        priority={priority}
        sizes="(max-width: 640px) 70vw, 320px"
        className={cn("h-auto w-full", className)}
      />
    );
  }

  // Repli : placeholder. Le <span> porte la sémantique (image ou décoratif).
  return (
    <span
      className="contents"
      {...(isDecorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": meta.alt })}
    >
      <PlaceholderFor name={name} className={cn("h-auto w-full", className)} />
    </span>
  );
}

export default Illustration;
