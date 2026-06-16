import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Surface douce lavande (brume) au lieu du blanc pur, pour le contenu
   * apaisant / émotionnel.
   * @default false
   */
  soft?: boolean;
  /**
   * Padding interne. `false` retire le padding (cartes à contenu sur-mesure).
   * @default true
   */
  padded?: boolean;
};

/**
 * Carte primitive Kitoo : rayon 22px, ombre diffuse douce teintée lavande.
 * Surface blanche par défaut, ou brume lavande via `soft`.
 * Jamais de bande d'accent colorée sur le bord gauche (règle du DS).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ soft = false, padded = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card shadow-sm",
          soft ? "bg-brand-100" : "bg-white",
          padded && "p-6",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export default Card;
