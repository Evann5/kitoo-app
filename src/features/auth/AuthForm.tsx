"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  type AuthFieldErrors,
  type AuthMode,
  isValid,
  validateAuthForm,
} from "@/lib/validation";
import { AuthField } from "./AuthField";

export type AuthFormProps = {
  mode: AuthMode;
  /** Chemin de retour après connexion réussie. @default "/profil" */
  redirectTo?: string;
};

/**
 * Traduit les messages d'erreur Supabase en français bienveillant. Reste
 * générique sur les identifiants (pas de fuite d'info : on ne révèle pas si
 * c'est l'email ou le mot de passe qui est faux).
 */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Tu dois d'abord confirmer ton email. Vérifie ta boîte mail.";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "Un compte existe déjà avec cet email. Essaie de te connecter.";
  }
  if (m.includes("rate limit") || m.includes("for security purposes")) {
    return "Trop de tentatives. Réessaie dans quelques instants.";
  }
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export function AuthForm({ mode, redirectTo = "/profil" }: AuthFormProps) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const isSignup = mode === "signup";

  function focusFirstError(errors: AuthFieldErrors) {
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmation) confirmationRef.current?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const email = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const confirmation = confirmationRef.current?.value ?? "";

    const errors = validateAuthForm(mode, { email, password, confirmation });
    setFieldErrors(errors);
    if (!isValid(errors)) {
      focusFirstError(errors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          },
        });
        if (error) {
          setFormError(mapAuthError(error.message));
          return;
        }
        // Confirmation email désactivée → session immédiate → on entre.
        if (data.session) {
          router.replace(redirectTo);
          router.refresh();
          return;
        }
        // Confirmation email activée → pas de session → on invite à vérifier.
        setCheckEmail(true);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setFormError(mapAuthError(error.message));
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFormError("Connexion impossible pour le moment. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div role="status" className="flex flex-col gap-3 text-center">
        <h2 className="font-display text-title text-ink-900">
          Vérifie ta boîte mail
        </h2>
        <p className="text-body text-ink-600">
          On t&apos;a envoyé un lien de confirmation. Clique dessus pour activer
          ton compte, puis reviens te connecter.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <p
          role="alert"
          className="rounded-control bg-danger/10 text-small text-danger px-4 py-3"
        >
          {formError}
        </p>
      ) : null}

      <AuthField
        ref={emailRef}
        name="email"
        type="email"
        label="Adresse email"
        autoComplete="email"
        inputMode="email"
        placeholder="toi@exemple.fr"
        error={fieldErrors.email}
        disabled={loading}
        required
      />

      <AuthField
        ref={passwordRef}
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? "8 caractères minimum" : undefined}
        error={fieldErrors.password}
        disabled={loading}
        required
      />

      {isSignup ? (
        <AuthField
          ref={confirmationRef}
          name="confirmation"
          type="password"
          label="Confirme ton mot de passe"
          autoComplete="new-password"
          error={fieldErrors.confirmation}
          disabled={loading}
          required
        />
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {isSignup ? "Créer mon compte" : "Me connecter"}
      </Button>
    </form>
  );
}

export default AuthForm;
