import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Classes de micro-interaction « squish » : léger enfoncement doux au press,
 * neutralisé sous `prefers-reduced-motion` (via `motion-safe:`). Réutilisable
 * sur tout élément cliquable (cards, tuiles…).
 */
export const pressClasses = cn(
  "transition-transform duration-kitoo ease-kitoo",
  "motion-safe:active:scale-[0.98]",
);

type PressableTag = "button" | "a" | "div";

export type PressableProps = {
  /** Élément rendu. @default "button" */
  as?: PressableTag;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement> &
  Partial<
    Pick<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      "href" | "target" | "rel"
    >
  >;

/**
 * Enveloppe un élément cliquable pour lui appliquer le « squish » doux de Kitoo.
 * Utile pour rendre des cards/tuiles tactiles cohérentes avec les boutons.
 *
 * @example
 * <Pressable as="a" href="/ressource" className="block rounded-card">
 *   <Card>…</Card>
 * </Pressable>
 */
export const Pressable = forwardRef<HTMLElement, PressableProps>(
  ({ as = "button", className, children, ...props }, ref) => {
    const Tag = as as "button";
    const typeProp = as === "button" ? { type: "button" as const } : null;
    return (
      <Tag
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(pressClasses, className)}
        {...typeProp}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Pressable.displayName = "Pressable";

export default Pressable;
