import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type IconButtonVariant = "ghost" | "solid" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

const base = cn(
  "inline-flex shrink-0 items-center justify-center rounded-pill",
  "transition-[transform,background-color,box-shadow,border-color] duration-kitoo ease-kitoo",
  "motion-safe:active:scale-[0.94]",
  "disabled:pointer-events-none disabled:opacity-50",
);

const variants: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent text-ink-700 hover:bg-brand-100 hover:text-brand-700",
  solid: "bg-brand-700 text-white shadow-btn hover:bg-brand-800",
  outline: "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "h-9 w-9", // 36px (desktop)
  md: "h-11 w-11", // 44px, cible tactile mobile
  lg: "h-12 w-12",
};

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> & {
  /** Libellé accessible **obligatoire** (le bouton n'a pas de texte visible). */
  "aria-label": string;
  /** @default "ghost" */
  variant?: IconButtonVariant;
  /** @default "md" */
  size?: IconButtonSize;
};

/**
 * Bouton icône rond, cohérent avec `Button` (mêmes états hover/active/focus).
 * `aria-label` est requis par le typage : un bouton icône doit toujours être
 * nommé pour les lecteurs d'écran.
 *
 * @example
 * <IconButton aria-label="Ouvrir le menu" onClick={open}>
 *   <Menu aria-hidden />
 * </IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { variant = "ghost", size = "md", className, type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
