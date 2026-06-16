import { cn } from "@/lib/cn";
import { Illustration } from "./Illustration";

export type BlobProps = {
  className?: string;
  /** Respiration très légère (idle), neutralisée en reduced-motion. @default false */
  animate?: boolean;
};

/**
 * Décor organique doux (forme lavande/pervenche) pour habiller le fond des
 * sections. Toujours **décoratif** (`aria-hidden`). À positionner via
 * `className` (ex. `absolute -z-10 ...`). Respiration idle optionnelle.
 *
 * @example
 * <Blob className="pointer-events-none absolute -right-24 top-0 -z-10 w-[480px]" />
 */
export function Blob({ className, animate = false }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "will-change-transform",
        animate && "motion-safe:animate-breathe",
        className,
      )}
    >
      <Illustration name="blob-soft" decorative />
    </div>
  );
}

export default Blob;
