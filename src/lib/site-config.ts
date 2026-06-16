/**
 * Global, non-secret configuration for the Kitoo application.
 * Safe to import from both Server and Client Components.
 */
export const siteConfig = {
  name: "Kitoo",
  description: "Application Kitoo — suivi d'humeur et espace bien-être.",
  /**
   * Optional link back to the marketing site (vitrine).
   * Set via NEXT_PUBLIC_SITE_URL, otherwise null (no back-link rendered).
   */
  marketingUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
} as const;

export type SiteConfig = typeof siteConfig;
