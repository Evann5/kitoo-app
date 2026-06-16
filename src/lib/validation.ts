/**
 * Validation des entrées d'authentification — partagée client + serveur.
 * Messages en français, bienveillants. Les fonctions renvoient un message
 * d'erreur (string) ou `null` si la valeur est valide.
 */

/** Longueur minimale du mot de passe (cohérente avec Supabase Auth). */
export const PASSWORD_MIN_LENGTH = 8;

// Regex email volontairement simple et tolérante (la vérification fine est
// faite côté Supabase). Évite les faux négatifs sur des adresses valides.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Indique ton adresse email.";
  if (!EMAIL_RE.test(value)) return "Cette adresse email n'est pas valide.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Choisis un mot de passe.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Ton mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) return "Confirme ton mot de passe.";
  if (password !== confirmation)
    return "Les mots de passe ne correspondent pas.";
  return null;
}

export type AuthMode = "signin" | "signup";

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  confirmation?: string;
};

/**
 * Valide l'ensemble d'un formulaire d'auth. En connexion, on ne vérifie que la
 * présence/forme de l'email et la présence du mot de passe (pas sa longueur :
 * un ancien mot de passe court resterait valide).
 */
export function validateAuthForm(
  mode: AuthMode,
  fields: { email: string; password: string; confirmation?: string },
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmail(fields.email);
  if (emailError) errors.email = emailError;

  if (mode === "signup") {
    const passwordError = validatePassword(fields.password);
    if (passwordError) errors.password = passwordError;

    const confirmationError = validatePasswordConfirmation(
      fields.password,
      fields.confirmation ?? "",
    );
    if (confirmationError) errors.confirmation = confirmationError;
  } else {
    if (!fields.password) errors.password = "Saisis ton mot de passe.";
  }

  return errors;
}

/** Vrai si l'objet d'erreurs ne contient aucune erreur. */
export function isValid(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length === 0;
}
