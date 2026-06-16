import { cn } from "@/lib/cn";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Largeur max :
   * - `content` : ~1180px (contenu applicatif large).
   * - `prose` : ~680px (texte long, lecture confortable).
   * @default "content"
   */
  width?: "content" | "prose";
};

/**
 * Container : centre le contenu et borne sa largeur. Padding horizontal
 * responsive (mobile-first).
 */
export function Container({
  width = "content",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        width === "prose" ? "max-w-prose" : "max-w-content",
        className,
      )}
      {...props}
    />
  );
}

export default Container;
