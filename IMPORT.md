# IMPORT — Dépôt manuel du design system Kitoo

Ce projet (étape **A0**) ne fait que **scaffolder l'architecture**. Aucun design
system n'est câblé : les dossiers ci-dessous sont créés et **attendent vos
fichiers** (copiés manuellement depuis la vitrine). Le projet **builde déjà**
même avec ces dossiers vides.

> ⚠️ Le **câblage** (fusion Tailwind, polices, tokens, activation du registre de
> primitives/illustrations) se fera à l'**étape suivante**, une fois les fichiers
> déposés ici. Ne rien câbler maintenant.

---

## Checklist de dépôt

### 1. `design-system/`

- [ ] `design-system/tokens/` ← vos tokens (couleurs, espacements, radii…).
- [ ] `design-system/fonts/` ← polices (ex. `goodly-medium.otf`).
- [ ] `design-system/assets/` ← logo Kitoo (source).
- [ ] `design-system/guidelines/` ← guidelines de marque (PDF).
- [ ] `design-system/reference/` ← le **`tailwind.config.ts`** + **`globals.css`**
      de la vitrine, **pour fusion ultérieure**.
      ⚠️ Ne PAS écraser le `globals.css` / la config Tailwind du nouveau projet —
      ces fichiers servent uniquement de référence pour la fusion.

### 2. `public/`

- [ ] `public/illustrations/` ← émotions `kitoo-*` + décors.
- [ ] `public/` (racine) ← logo (favicon / og-image / logo public).

### 3. `src/components/`

- [ ] `src/components/ui/` ← primitives : `Button`, `Card`, `Badge`, `Tag`,
      `Container`, `Section`, `Pressable`, …
- [ ] `src/components/illustrations/` ← `Illustration`, `Mascot`, `Blob`.
- [ ] `src/components/motion/` ← `Reveal`, `Stagger`.

### 4. `src/lib/`

- [ ] `src/lib/illustrations.ts` ← registre des illustrations.
- [ ] `src/lib/motion.ts` ← presets de motion.

---

## Déjà en place (ne pas redéposer)

- `src/lib/supabase/client.ts` & `server.ts` — clients Supabase (tolérants à
  l'absence d'env).
- `src/lib/site-config.ts` — nom « Kitoo » + lien retour optionnel vers la vitrine.
- `.env.local.example` — gabarit des variables Supabase.
- Tooling : ESLint, Prettier (+ `prettier-plugin-tailwindcss`), TS strict.
- Tests : Vitest + Testing Library (jsdom) et Playwright.

---

## Étape suivante (après dépôt)

1. Fusionner `design-system/reference/tailwind.config.ts` + `globals.css` dans la
   config du projet (Tailwind v4 : `@theme` dans `src/app/globals.css`).
2. Câbler les polices dans `src/app/layout.tsx` (remplacer Geist par les polices
   Kitoo) — voir le `TODO` du fichier.
3. Activer les registres `src/lib/illustrations.ts` / `src/lib/motion.ts` et les
   composants `ui` / `illustrations` / `motion`.
