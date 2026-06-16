import { Container } from "@/components/ui";
import { TabBar } from "./TabBar";

export type AppShellProps = {
  children: React.ReactNode;
  /** Largeur du contenu. @default "content" */
  width?: "content" | "prose";
};

/**
 * Coquille des pages privées : contenu centré + barre d'onglets fixe en bas
 * (avec le padding bas nécessaire pour ne pas masquer le contenu).
 */
export function AppShell({ children, width = "prose" }: AppShellProps) {
  return (
    <>
      <Container width={width} className="pt-6 pb-28">
        {children}
      </Container>
      <TabBar />
    </>
  );
}

export default AppShell;
