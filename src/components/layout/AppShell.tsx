import { Container } from "@/components/ui";
import {
  AccessibilitySync,
  getAccessibilityPrefs,
} from "@/features/accessibility";
import { getUser } from "@/lib/auth";
import { TabBar } from "./TabBar";

export type AppShellProps = {
  children: React.ReactNode;
  /** Largeur du contenu. @default "content" */
  width?: "content" | "prose";
};

/**
 * Coquille des pages privées : synchronise les préférences d'accessibilité
 * (profil → document, inter-appareils), centre le contenu et affiche la barre
 * d'onglets fixe en bas.
 */
export async function AppShell({ children, width = "prose" }: AppShellProps) {
  const [prefs, user] = await Promise.all([getAccessibilityPrefs(), getUser()]);
  const initial = user?.email?.[0]?.toUpperCase();
  return (
    <>
      <AccessibilitySync prefs={prefs} />
      <Container width={width} className="pt-6 pb-28">
        {children}
      </Container>
      <TabBar userInitial={initial} />
    </>
  );
}

export default AppShell;
