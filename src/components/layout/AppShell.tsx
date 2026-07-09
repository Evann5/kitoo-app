import { Container } from "@/components/ui";
import {
  AccessibilitySync,
  getAccessibilityPrefs,
} from "@/features/accessibility";

export type AppShellProps = {
  children: React.ReactNode;
  /** Largeur du contenu. @default "content" */
  width?: "content" | "prose";
};

/**
 * Coquille des pages privées : synchronise les préférences d'accessibilité
 * (profil → document, inter-appareils) et centre le contenu. La barre d'onglets
 * est rendue **une seule fois** dans le layout racine (persistante entre les
 * navigations) ; on réserve l'espace bas (`pb-28`) pour ne pas être masqué.
 */
export async function AppShell({ children, width = "prose" }: AppShellProps) {
  const prefs = await getAccessibilityPrefs();
  return (
    <>
      <AccessibilitySync prefs={prefs} />
      <Container
        width={width}
        className="pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-28"
      >
        {children}
      </Container>
    </>
  );
}

export default AppShell;
