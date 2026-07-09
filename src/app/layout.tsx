import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Nunito, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { ANTI_FLASH_SCRIPT } from "@/features/accessibility";
import { TabBar } from "@/components/layout/TabBar";
import { ChatFab } from "@/components/chat/ChatFab";

/**
 * Police d'affichage Kitoo : Goodly Medium (locale, .otf).
 * Repli Poppins si la police échoue/charge mal (cf. stack `font-display`).
 */
const goodly = localFont({
  src: "../../design-system/fonts/goodly-medium.otf",
  variable: "--font-display",
  display: "swap",
  weight: "500",
  fallback: ["Poppins", "system-ui", "sans-serif"],
});

/** Police de corps : Nunito (douce, arrondie). */
const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/** Police dyslexie : Atkinson Hyperlegible (activée via data-font="dyslexia"). */
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-dyslexia",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

/**
 * `viewport-fit=cover` : l'app s'étend sous la barre d'état / Dynamic Island des
 * iPhone. On récupère alors l'espace réservé via `env(safe-area-inset-*)` dans
 * la coquille et la barre d'onglets (évite tout chevauchement avec l'heure).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${goodly.variable} ${nunito.variable} ${atkinson.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-flash : applique les préférences d'accessibilité avant le rendu. */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body className="font-body flex min-h-full flex-col">
        {children}
        {/* Barre + FAB persistants : se masquent hors des routes concernées. */}
        <TabBar />
        <ChatFab />
      </body>
    </html>
  );
}
