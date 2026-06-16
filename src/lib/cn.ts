import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind de façon sûre : `clsx` gère les valeurs
 * conditionnelles, `tailwind-merge` résout les conflits (la dernière classe
 * d'un même groupe l'emporte, ex. `rounded-control` vs `rounded-pill`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
