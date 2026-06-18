import type { Metadata } from "next";
import { AuthForm, AuthShell, safeRedirect } from "@/features/auth";

export const metadata: Metadata = {
  title: "Connexion - Kitoo",
  description: "Connecte-toi à ton espace Kitoo.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = safeRedirect(redirect);

  return (
    <AuthShell
      title="Content de te revoir"
      subtitle="Connecte-toi pour retrouver ton espace."
      pose="heart"
      footer={{
        prompt: "Pas encore de compte ?",
        linkLabel: "Crée ton compte",
        href: "/inscription",
      }}
    >
      <AuthForm mode="signin" redirectTo={redirectTo} />
    </AuthShell>
  );
}
