# Kitoo — application (MVP)

Application **Kitoo** : suivi d'humeur (Mood Tracker), statistiques et espace
bien-être, avec authentification email / mot de passe.

**Production** : https://kitoo-app.vercel.app — déployée en continu sur Vercel
(chaque `git push` sur `main` redéploie automatiquement). Détails et procédure :
[`DEPLOY.md`](./DEPLOY.md).

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

## Authentification

Auth email / mot de passe via **Supabase Auth** (`@supabase/ssr`), avec gestion
des sessions par cookies côté serveur et client (App Router).

### Configuration

- Projet Supabase `kitoo-app` en région `eu-west-3` (RGPD).
- Variables : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (locales dans `.env.local`, et sur les 3 environnements Vercel). La clé `anon`
  est publique par conception ; `service_role` n'est jamais utilisée ni commitée.

### Confirmation email

Le code gère **les deux cas** :

- **désactivée** (choix retenu pour Kitoo) → inscription = connexion directe ;
- **activée** → écran « vérifie ta boîte mail » + route `/auth/callback` qui
  échange le code contre une session.

Le réglage se fait dans le dashboard Supabase (Authentication → Email →
« Confirm email »). Détails dans [`DEPLOY.md`](./DEPLOY.md).

### Routes

| Route              | Accès  | Rôle                                               |
| ------------------ | ------ | -------------------------------------------------- |
| `/inscription`     | public | création de compte (email, mot de passe + confirm) |
| `/connexion`       | public | connexion                                          |
| `/auth/callback`   | public | échange du code de confirmation (si activée)       |
| `/profil`          | privé  | email + déconnexion                                |
| `/tableau-de-bord` | privé  | (réservé, à venir)                                 |

La protection est assurée par [`middleware.ts`](./middleware.ts) (rafraîchit la
session et redirige : non connecté → `/connexion`, déjà connecté hors des écrans
d'auth → `/profil`), doublée du helper serveur
[`requireUser()`](./src/lib/auth.ts) sur les pages privées.

### Sécurité & accessibilité

Validation des entrées (email, mot de passe ≥ 8), messages d'erreur français
bienveillants et **génériques** sur les identifiants (pas de fuite d'info),
rate-limit géré par Supabase. Formulaires accessibles (labels liés,
`aria-invalid`, erreurs reliées via `aria-describedby`, `autocomplete`, focus
visible pervenche), corps ≥ 16px, cibles ≥ 44px. Disclaimer « Kitoo ne remplace
pas un suivi médical professionnel » sur les écrans d'auth.

## Design system câblé

Le design system Kitoo (importé manuellement, cf. [`IMPORT.md`](./IMPORT.md)) est
désormais **branché** dans l'app.

### Tokens Tailwind

[`tailwind.config.ts`](./tailwind.config.ts) (à la racine) contient les extensions
fusionnées : couleurs `brand` (pervenche), `ink` (neutres lavande), `mood`
(variables CSS) et sémantiques (`success`/`warning`/`danger`) ; `borderRadius`
(`control` 16px, `card` 22px, `panel` 30px, `pill`) ; `boxShadow` (`sm`/`md`/
`brand`/`focus` + `btn`/`btn-press` pour l'effet 3D) ; `spacing`, `fontFamily`
(`display`/`body`/`dyslexia`), échelle `fontSize` (corps ≥ 16px), `maxWidth`,
courbe et durée `kitoo`, keyframes `float`/`breathe`.

Tailwind v4 charge ce fichier via `@config "../../tailwind.config.ts"` dans
[`src/app/globals.css`](./src/app/globals.css), qui définit aussi les variables de
marque, le canvas `ink-50`, le texte `ink-900`, l'anneau de focus pervenche
(`:focus-visible`), la bascule daltonisme (`data-contrast="colorblind"`), le mode
dyslexie (`data-font="dyslexia"`) et le respect de `prefers-reduced-motion`.

### Polices (`next/font`)

Branchées dans [`layout.tsx`](./src/app/layout.tsx) en variables CSS :

- **Goodly Medium** (`next/font/local`, `--font-display`) — repli Poppins.
- **Nunito** (`next/font/google`, `--font-body`) — corps.
- **Atkinson Hyperlegible** (`next/font/google`, `--font-dyslexia`) — mode dyslexie.

### Composants

Primitives [`src/components/ui/`](./src/components/ui) (Button, IconButton, Card,
Badge, Tag, Pill, Container, Section, Pressable, MoodFace), illustrations
[`src/components/illustrations/`](./src/components/illustrations) (Illustration,
Mascot, Blob + placeholders) et motion
[`src/components/motion/`](./src/components/motion) (Reveal, Stagger). Helpers
ajoutés : `@/lib/cn`, `@/lib/moods`, `@/lib/illustration-assets`,
`@/hooks/useReducedMotion`.

> Note RSC : utiliser `StaggerItem` (export nommé) et non `Stagger.Item` depuis un
> Server Component — une propriété statique sur un composant `"use client"` ne
> traverse pas la frontière serveur/client.

### Registre d'illustrations

[`src/lib/illustrations.ts`](./src/lib/illustrations.ts) résout les clés `kitoo-*`
vers `public/illustrations/`. Si un asset manque, `Illustration` affiche un
placeholder doux. Le manifeste des assets présents est
[`src/lib/illustration-assets.ts`](./src/lib/illustration-assets.ts) (à mettre à
jour après ajout/suppression d'un fichier). Le logo sert de favicon via
[`src/app/icon.png`](./src/app/icon.png).

### Page de validation

[`/styleguide`](http://localhost:3000/styleguide) (dev uniquement, **404 en
production**) : couleurs, primitives (tous variants), visages d'humeur et poses de
la mascotte. La page d'accueil `/` est une entrée minimale stylée Kitoo (logo,
titre Goodly, mascotte, `Button`).

### `design-system/reference/` — hors build

Les fichiers `design-system/reference/tailwind.config.ts` + `globals.css` (et tout
`design-system/`) sont **conservés comme source de fusion** mais exclus de la
compilation et du lint (`tsconfig.json` `exclude`, `eslint.config.mjs`
`globalIgnores`) — ils ne sont jamais intégrés au bundle.
