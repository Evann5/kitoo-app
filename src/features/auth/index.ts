export { AuthForm } from "./AuthForm";
export type { AuthFormProps } from "./AuthForm";
export { AuthShell } from "./AuthShell";
export type { AuthShellProps } from "./AuthShell";
export { AuthField } from "./AuthField";
export { signOut } from "./actions";

/**
 * Normalise un paramètre `redirect` en chemin interne sûr : empêche les
 * redirections ouvertes (open redirect) vers un domaine externe.
 *
 * Règles : doit commencer par "/" (chemin interne), jamais "//host"
 * (protocole-relatif), aucun backslash (les navigateurs normalisent "\" en "/",
 * ce qui transforme "/\evil.com" en URL externe) ni caractère de contrôle
 * (CR/LF — anti header-injection). Sinon on retombe sur `fallback`.
 */
export function safeRedirect(
  value: string | undefined,
  fallback = "/tableau-de-bord",
) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    // Caractère de contrôle (< espace) ou backslash (0x5C) → non sûr.
    if (code < 0x20 || code === 0x5c) return fallback;
  }
  return value;
}
