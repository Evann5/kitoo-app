/**
 * Manifeste des illustrations réellement présentes dans `public/illustrations/`.
 *
 * Build-safe (aucun accès `fs` au runtime → fonctionne côté client comme côté
 * serveur). `Illustration` s'en sert pour décider d'afficher l'asset réel ou un
 * placeholder doux quand le fichier n'a pas encore été déposé.
 *
 * ⚠️ Généré à la main d'après le contenu du dossier. Après ajout/suppression
 * d'un asset, mettre cette liste à jour (ou la régénérer) :
 *   ls public/illustrations | grep -vE '^\.'
 */
export const EXISTING_ILLUSTRATION_ASSETS: ReadonlySet<string> = new Set([
  "kitoo-bubble-tea.png",
  "kitoo-classic.png",
  "kitoo-crying.png",
  "kitoo-heart.png",
  "kitoo-skating.png",
  "kitoo-sleeping.png",
  "kitoo-soda.png",
  "kitoo-sunglasses.png",
]);

/** Vrai si l'asset final (par nom de fichier) est présent dans `public/`. */
export function illustrationAssetExists(file: string): boolean {
  return EXISTING_ILLUSTRATION_ASSETS.has(file);
}
