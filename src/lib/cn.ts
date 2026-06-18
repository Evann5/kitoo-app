import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `tailwind-merge` configuré pour connaître les **tailles de police custom** du
 * design system (`text-eyebrow|small|body|heading|title|display`). Sans ça,
 * `tailwind-merge` les prend pour des **couleurs** de texte et les met en
 * conflit avec `text-white`/`text-ink-*` (la dernière l'emporte) — ce qui
 * effaçait par ex. le `text-white` des boutons (texte noir sur fond violet).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["eyebrow", "small", "body", "heading", "title", "display"] },
      ],
    },
  },
});

/**
 * Fusionne des classes Tailwind de façon sûre : `clsx` gère les valeurs
 * conditionnelles, `tailwind-merge` résout les conflits (la dernière classe
 * d'un même groupe l'emporte, ex. `rounded-control` vs `rounded-pill`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
