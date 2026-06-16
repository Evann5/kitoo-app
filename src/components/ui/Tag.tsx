import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type TagProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * État sélectionné : remplissage pervenche.
   * @default false
   */
  selected?: boolean;
};

/**
 * Tag : pill interactif sélectionnable (rayon 999px), pour filtres / choix.
 * Contour neutre par défaut, pervenche plein quand `selected`.
 */
export const Tag = forwardRef<HTMLButtonElement, TagProps>(
  ({ selected = false, className, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          "rounded-pill text-small inline-flex items-center px-3 py-1 font-bold",
          "duration-kitoo ease-kitoo transition-colors",
          selected
            ? "bg-brand-700 text-white"
            : "border-ink-300 text-ink-700 hover:bg-brand-100 hover:text-brand-700 border",
          className,
        )}
        {...props}
      />
    );
  },
);

Tag.displayName = "Tag";

export default Tag;
