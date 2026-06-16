import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind — tokens du design system Kitoo.
 *
 * Fusion des extensions issues de `design-system/reference/tailwind.config.ts`
 * (source de vérité : `design-system/guidelines/Kitoo_Design_System.pdf`).
 * Chargée par Tailwind v4 via la directive `@config` dans `src/app/globals.css`.
 *
 * Principes : tout est arrondi et doux, ombres diffuses teintées lavande
 * (jamais de gris-neutre dur), pervenche comme couleur de marque, encre à cast
 * froid/lavande pour les neutres.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pervenche — couleur primaire / de marque (graine = 500).
        brand: {
          50: "#F3F3FE",
          100: "#E9EAFA", // brume lavande — surface douce
          200: "#D7D8F6",
          300: "#BFC0F4",
          400: "#ABACF2",
          500: "#9B9DF0", // graine de marque
          600: "#7E80E6", // hover par défaut des boutons
          700: "#6466CF",
          800: "#4F50A8",
          900: "#3B3C7D",
          DEFAULT: "#9B9DF0",
        },
        // Neutres « encre » — cast froid/lavande, jamais gris chaud.
        ink: {
          50: "#FAFAFD", // canvas de l'app (off-white teinté lavande)
          100: "#F2F2F7",
          200: "#E6E6EE", // filets / bordures subtiles
          300: "#D2D2DE", // bordures de contrôle par défaut
          400: "#A6A7B8",
          500: "#7C7D90",
          600: "#5C5D70", // couleur d'icône par défaut
          700: "#44455A",
          800: "#2E2F45",
          900: "#16161D", // texte principal
          DEFAULT: "#16161D",
        },
        // Échelle d'humeur — couleurs fixes du DS, exposées en variables CSS
        // pour permettre la bascule daltonisme (override dans globals.css).
        mood: {
          "very-positive": "var(--mood-very-positive)",
          positive: "var(--mood-positive)",
          neutral: "var(--mood-neutral)",
          negative: "var(--mood-negative)",
          "very-negative": "var(--mood-very-negative)",
        },
        // Sémantique — accordée au pervenche, jamais criarde.
        success: "#38B27E",
        warning: "#F2A33C",
        danger: "#E5575C",
      },
      borderRadius: {
        control: "16px", // boutons, inputs
        card: "22px", // cartes
        panel: "30px", // panneaux / grandes surfaces
        pill: "9999px", // pills, tags, badges
      },
      boxShadow: {
        // Ombres douces, diffuses, teintées lavande rgba(42,43,87,…).
        sm: "0 1px 2px rgba(42,43,87,0.06), 0 2px 6px rgba(42,43,87,0.06)",
        md: "0 6px 16px rgba(42,43,87,0.08), 0 12px 32px rgba(42,43,87,0.08)",
        brand: "0 8px 24px rgba(155,157,240,0.35)", // légère lueur pervenche
        focus: "0 0 0 4px rgba(155,157,240,0.40)", // anneau de focus 4px
        // Boutons « 3D » : épaisseur basse pervenche foncée (brand-900) + halo
        // lavande diffus. `btn-press` = état enfoncé (épaisseur réduite).
        btn: "0 4px 0 0 #3B3C7D, 0 8px 18px rgba(42,43,87,0.18)",
        "btn-press": "0 1px 0 0 #3B3C7D, 0 3px 10px rgba(42,43,87,0.14)",
      },
      spacing: {
        // Pas de demi-unité doux et gouttières larges propres au DS.
        4.5: "1.125rem",
        18: "4.5rem",
      },
      fontFamily: {
        // Variables exposées par next/font dans layout.tsx.
        display: ["var(--font-display)", "Poppins", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        dyslexia: ["var(--font-dyslexia)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Échelle typographique du DS. Le corps ne descend jamais < 16px (WCAG) ;
        // `small`/`eyebrow` sont réservés aux libellés, pas au texte long.
        eyebrow: ["10px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        small: ["13px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.6" }],
        heading: ["16px", { lineHeight: "1.4", fontWeight: "700" }],
        title: ["24px", { lineHeight: "1.25", fontWeight: "700" }],
        display: ["46px", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        content: "1180px", // largeur max du contenu applicatif
        prose: "680px", // largeur max du texte long
      },
      transitionTimingFunction: {
        // Entrées douces et rassurantes — aucun rebond ni overshoot.
        kitoo: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        kitoo: "200ms",
      },
      keyframes: {
        // Flottement doux (idle de la mascotte) — montée/descente subtile.
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // Respiration très légère (décors organiques).
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        // Gardés derrière `motion-safe:` à l'usage → neutralisés en reduced-motion.
        float: "float 6s ease-in-out infinite",
        breathe: "breathe 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
