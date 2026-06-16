# Kitoo — application (MVP)

Application **Kitoo** : suivi d'humeur (Mood Tracker), statistiques et espace
bien-être, avec authentification email / mot de passe.

> Dépôt **séparé** du site vitrine. Cette base correspond à l'étape **A0**
> (scaffold d'architecture). Le design system est **importé manuellement** —
> voir [`IMPORT.md`](./IMPORT.md). Aucun câblage du design system ni logique
> métier à ce stade.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** (v4)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — auth + données
- **Tests** : Vitest + Testing Library (jsdom) · Playwright (e2e)
- **Tooling** : ESLint · Prettier (+ `prettier-plugin-tailwindcss`)
- Gestionnaire de paquets : **pnpm**

## Démarrage

```bash
pnpm install
cp .env.local.example .env.local   # renseigner les clés Supabase (optionnel au build)
pnpm dev                           # http://localhost:3000
```

Les clients Supabase sont **tolérants à l'absence de variables d'env** : le build
et le rendu du placeholder fonctionnent sans `.env.local`.

## Scripts

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Serveur de développement            |
| `pnpm build`        | Build de production                 |
| `pnpm start`        | Sert le build de production         |
| `pnpm lint`         | ESLint                              |
| `pnpm format`       | Prettier (écriture)                 |
| `pnpm format:check` | Prettier (vérification)             |
| `pnpm test`         | Tests unitaires/composants (Vitest) |
| `pnpm test:e2e`     | Tests end-to-end (Playwright)       |

## Arborescence

```
src/
  app/                  layout, page (placeholder), globals.css
  components/
    ui/                 ← primitives (Button, Card, Badge, Tag, Container…)
    illustrations/      ← Illustration, Mascot, Blob
    motion/             ← Reveal, Stagger
    layout/
  features/
    auth/  mood/  dashboard/  wellbeing/
  lib/
    supabase/           client.ts (browser) + server.ts (server)
    site-config.ts      ← en place
    illustrations.ts    ← à déposer
    motion.ts           ← à déposer
public/
  illustrations/        ← émotions kitoo-* + décors
design-system/
  tokens/ fonts/ assets/ guidelines/ reference/
tests/
  unit/                 tests Vitest
  e2e/                  tests Playwright
```

## Variables d'environnement

Voir [`.env.local.example`](./.env.local.example) :

```
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

`.env.local` est ignoré par git ; `.env.local.example` est versionné.

## Design system

À importer manuellement — checklist complète dans [`IMPORT.md`](./IMPORT.md).
Le câblage (fusion Tailwind / polices / tokens) interviendra à l'étape suivante.
