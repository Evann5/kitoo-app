import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/** Variantes visuelles du bouton (cf. design system Kitoo). */
export type ButtonVariant = "primary" | "ghost" | "outline";

/** Tailles disponibles. */
export type ButtonSize = "sm" | "md" | "lg";

const base = cn(
  "relative inline-flex items-center justify-center gap-2 rounded-control font-body font-bold",
  "select-none whitespace-nowrap",
  // Mouvement doux, jamais de rebond. Transitions sur transform/ombre (GPU).
  "transition-[transform,background-color,box-shadow,border-color] duration-kitoo ease-kitoo",
  "disabled:pointer-events-none disabled:opacity-50",
);

/**
 * Anatomie de l'effet « 3D » :
 * - `primary` : dessus pervenche (brand-700) + épaisseur basse pervenche foncée
 *   (`shadow-btn`, bord bas brand-900) + halo lavande. Au press, le bouton
 *   descend (`translate-y`) et l'épaisseur se réduit (`shadow-btn-press`).
 * - `outline` : épaisseur basse neutre (ombre ink-300), même enfoncement doux.
 * - `ghost` : simple « squish » (léger scale), sans épaisseur.
 *
 * Le déplacement au press est gardé derrière `motion-safe:` → neutralisé sous
 * `prefers-reduced-motion` (l'épaisseur statique, elle, reste).
 */
const variants: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-brand-700 text-white shadow-btn hover:bg-brand-800",
    "motion-safe:active:translate-y-[3px] motion-safe:active:shadow-btn-press",
  ),
  outline: cn(
    "border border-ink-300 bg-white text-ink-900 shadow-[0_3px_0_0_#D2D2DE]",
    "hover:bg-ink-100",
    "motion-safe:active:translate-y-[2px] motion-safe:active:shadow-[0_1px_0_0_#D2D2DE]",
  ),
  ghost: cn(
    "bg-transparent text-brand-700 hover:bg-brand-100",
    "motion-safe:active:scale-[0.98]",
  ),
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-small",
  md: "h-11 px-5 text-body", // 44px, cible tactile mobile
  lg: "h-12 px-6 text-body",
};

/**
 * Compose les classes du bouton Kitoo. Réutilisable pour styliser un lien `<a>`
 * comme un bouton (ex. CTA de navigation) sans imbriquer `<button>` dans `<a>`.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

/** Spinner discret affiché en état `loading`. */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 motion-safe:animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type CommonProps = {
  /**
   * - `primary` : action principale (pervenche, effet 3D).
   * - `ghost` : action secondaire (lavande au survol).
   * - `outline` : action tertiaire (contour neutre).
   * @default "primary"
   */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** Occupe toute la largeur disponible. */
  fullWidth?: boolean;
  /** Affiche un spinner et désactive l'interaction. */
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps & {
  as?: "button";
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

type ButtonAsLink = CommonProps & {
  as: "a";
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Bouton signature Kitoo : effet 3D épais qui s'enfonce au press, états
 * hover/active/focus-visible/disabled. Rayon 16px, casse phrase.
 *
 * Polymorphe : rendu `<button>` par défaut, ou `<a>` via `as="a"` (utile pour
 * les CTA-liens vers `appUrl`, sans imbriquer `<button>` dans `<a>`).
 *
 * @example
 * <Button onClick={save}>Noter mon humeur</Button>
 * @example
 * <Button as="a" href={appUrl} target="_blank" rel="noopener noreferrer">
 *   Accéder à l'app
 * </Button>
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    loading = false,
    className,
    children,
    as = "button",
    ...rest
  } = props;

  const classes = buttonVariants({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading ? <Spinner /> : null}
      {children}
    </>
  );

  if (as === "a") {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        aria-busy={loading || undefined}
        {...(loading ? { "aria-disabled": true, tabIndex: -1 } : null)}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const {
    type = "button",
    disabled,
    ...buttonProps
  } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
