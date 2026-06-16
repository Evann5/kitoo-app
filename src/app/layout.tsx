import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nunito, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

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
      <body className="font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
