import type { Metadata } from "next";
import { AuthForm, AuthShell, safeRedirect } from "@/features/auth";

export const metadata: Metadata = {
  title: "Inscription — Kitoo",
  description: "Crée ton compte Kitoo et commence à suivre ton humeur.",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = safeRedirect(redirect);

  return (
    <AuthShell
      title="Crée ton compte"
      subtitle="Quelques secondes, et ton espace bien-être est à toi."
      pose="classic"
      footer={{
        prompt: "Tu as déjà un compte ?",
        linkLabel: "Connecte-toi",
        href: "/connexion",
      }}
    >
      <AuthForm mode="signup" redirectTo={redirectTo} />
    </AuthShell>
  );
}
