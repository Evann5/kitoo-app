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

## Modèle de données & RLS

Schéma défini par migrations versionnées dans
[`supabase/migrations/`](./supabase/migrations) (appliquées sur le projet
Supabase `kitoo-app`). Données de santé = sensibles RGPD → **Row-Level Security
stricte, default-deny**.

### Tables

| Table             | Contenu                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`        | 1/utilisateur : `prenom`, `notif_prefs`, `accessibility_prefs` (jsonb). Pas de donnée sensible superflue. Créée automatiquement à l'inscription (trigger `auth.users` → `profiles`). |
| `mood_entries`    | humeurs : `level` (1–5, `check`), `comment` (optionnel), `entry_date`. **1 entrée/jour/utilisateur** (`unique (user_id, entry_date)`).                                               |
| `mood_tags`       | tags prédéfinis (`slug`, `label`), seedés. Référence en lecture seule.                                                                                                               |
| `mood_entry_tags` | liaison N-N entre une entrée et ses tags.                                                                                                                                            |
| `resources`       | contenus bien-être (`theme`, `type`, `summary`, `content`, `mood_levels int[]`). 8 ressources seedées. Lecture seule.                                                                |
| `consents`        | consentements RGPD (`type`, `granted_at`, `revoked_at`).                                                                                                                             |

### Choix « tags » : table de liaison (pas `text[]`)

`mood_tags` + `mood_entry_tags` plutôt qu'une colonne `text[]` : tags prédéfinis
réutilisables (libellés FR centralisés), stats par tag faciles par jointure, et
intégrité référentielle. Le surcoût RLS (vérifier l'appartenance via l'entrée
parente) est assumé.

### Policies RLS

- **Données perso** (`profiles`, `mood_entries`, `consents`) : `select/insert/
update/delete` autorisés uniquement si `auth.uid() = user_id` (`id` pour
  `profiles`).
- **`mood_entry_tags`** : autorisé seulement si l'entrée parente appartient à
  l'utilisateur (`exists (… where me.user_id = auth.uid())`).
- **`resources` & `mood_tags`** : `select` pour tout utilisateur authentifié,
  aucune écriture côté app.
- `handle_new_user` (SECURITY DEFINER) : `search_path` figé + `execute` révoqué
  (anon/authenticated) — sert uniquement de trigger. Advisor sécurité Supabase
  sans alerte.

### Régénérer les types TypeScript

Les types générés sont dans
[`src/lib/supabase/types.ts`](./src/lib/supabase/types.ts) et branchés sur les
clients (`createBrowserClient<Database>` / `createServerClient<Database>`).
Après une migration, régénérer :

```bash
supabase gen types typescript --project-id binxcboxxrycjsqincbn > src/lib/supabase/types.ts
# (ou via l'outil MCP Supabase generate_typescript_types)
```

Helpers d'accès typés (server-only) :
[`src/features/mood/queries.ts`](./src/features/mood/queries.ts) et
[`src/features/wellbeing/queries.ts`](./src/features/wellbeing/queries.ts).

## Mood Tracker

Saisie d'humeur quotidienne (route privée [`/humeur`](./src/app/humeur/page.tsx)),
expérience « compagnon » douce. Code dans
[`src/features/mood/`](./src/features/mood).

### Règles métier

- **1 entrée par jour** par utilisateur (upsert sur `(user_id, entry_date)`),
  modifiable jusqu'à 23h59 le jour même. Les jours passés sont consultables mais
  non modifiables (seul le jour courant a un formulaire).
- La **date et l'`user_id` sont fixés côté serveur** (jamais le client) ;
  niveau validé en 1–5 avant écriture, via la server action
  [`saveMood`](./src/features/mood/actions.ts).

### Échelle d'humeur (fixe, design system)

5 Très positif `#FFD93D` · 4 Positif `#A8E6CF` · 3 Neutre `#E0E0E0` ·
2 Négatif `#FF8C42` · 1 Très négatif `#FF595E`. Visages dessinés (`MoodFace`),
jamais d'emoji comme affordance.

### Réaction du compagnon (humeur → mascotte)

| Niveau | Pose koala                                          |
| ------ | --------------------------------------------------- |
| 5      | `kitoo-sunglasses`                                  |
| 4      | `kitoo-soda`                                        |
| 3      | `kitoo-classic`                                     |
| 2      | `kitoo-classic` _(TODO pose « légèrement triste »)_ |
| 1      | `kitoo-crying`                                      |

Au choix de l'humeur, la mascotte change de pose et le fond prend la teinte
douce correspondante (transition `motion-reduce:transition-none` → neutralisée
sous `prefers-reduced-motion`).

### Accessibilité

Sélecteur en `radiogroup` (libellés textuels + visages, jamais la couleur
seule), navigation clavier (flèches / Home / End, roving tabindex,
`aria-checked`), chips de tags `aria-pressed`, formulaire labelisé, corps ≥ 16px,
cibles ≥ 44px, focus pervenche.

## Tableau de bord & stats

Page d'accueil de l'app connectée (route privée
[`/tableau-de-bord`](./src/app/tableau-de-bord/page.tsx), destination après
connexion). Code dans [`src/features/dashboard/`](./src/features/dashboard) ;
navigation par tab bar ([`TabBar`](./src/components/layout/TabBar.tsx) :
Accueil / Humeur / Bien-être / Profil).

### Contenu

Salutation contextuelle + date, carte koala compagnon avec bulle, CTA dominant
**« Noter »** ou **« Modifier mon humeur »** (selon l'entrée du jour), ressource
suggérée (« Pour toi aujourd'hui »), badge de série, indicateurs (humeur
moyenne, nombre d'entrées) et graphique de tendance hebdo/mensuel.

### Calculs (helpers purs & testables)

[`stats.ts`](./src/features/dashboard/stats.ts) opère sur des points
`{ entry_date, level }` (lecture sous RLS faite dans la page) :

- **série** (`computeStreak`) : jours consécutifs avec saisie en remontant
  depuis aujourd'hui ; non cassée si rien n'est noté aujourd'hui mais que la
  veille l'est ;
- **moyenne / nombre** (`computeStats`) sur 30 jours ;
- **séries de graphe** (`buildDailySeries`) avec trous `null` ;
- **alerte 3 jours** (`shouldShowSupportNudge`) : ≥ 3 jours « très négatif »
  (niveau 1) consécutifs récents.

### Gamification & alerte de soutien

Encouragements **positifs uniquement** (jamais de culpabilisation quand la série
est à 0). Après 3 jours « très négatif » consécutifs, une invitation **douce et
soutenante** ([`SupportNudge`](./src/features/dashboard/SupportNudge.tsx)) à
parler à un professionnel s'affiche — ton chaleureux, **aucun langage de
diagnostic**, avec le disclaimer « Kitoo ne remplace pas un suivi médical
professionnel ».

### Accessibilité des graphes

Le graphe SVG ([`MoodTrendChart`](./src/features/dashboard/MoodTrendChart.tsx),
recharts) est `aria-hidden`, **doublé d'un résumé textuel et d'une table de
données** (`sr-only`) ; l'humeur est portée par le libellé, pas seulement la
couleur. Animations neutralisées sous `prefers-reduced-motion`. État vide
chaleureux pour un compte sans donnée.

## Espace bien-être

Catalogue de ressources éducatives (routes privées
[`/bien-etre`](./src/app/bien-etre/page.tsx) et
[`/bien-etre/[id]`](./src/app/bien-etre/[id]/page.tsx)). Code dans
[`src/features/wellbeing/`](./src/features/wellbeing).

### Filtrage

Catalogue chargé une fois (RLS : `resources` en lecture pour authentifiés), puis
filtré côté client par **thème ET type** (cumulables) via des helpers purs
[`filters.ts`](./src/features/wellbeing/filters.ts) (`filterResources`,
`resourceThemes`, `resourceTypes`). Chips accessibles (`aria-pressed`, clavier) ;
état « aucun résultat » doux.

### Suggestion selon l'humeur

`suggestByLevel(resources, level)` propose les ressources dont `mood_levels`
contient le niveau de la **dernière humeur saisie** (rangée « Suggéré pour toi »).
Mapping bienveillant, jamais prescriptif (humeur basse → contenus d'apaisement
tagués pour les niveaux bas). Masquée si aucune humeur récente.

### Lecture intégrée

[`ResourceReader`](./src/features/wellbeing/ResourceReader.tsx) : contenu lu
**dans l'app, sans lien sortant**, en largeur de prose (~680px), hiérarchie de
titres correcte (h1), mention « rédigé et validé par des professionnels de
santé » et disclaimer. Icônes Lucide cohérentes (outline). `getResource` valide
le format UUID (404 propre sur id invalide).

## RGPD & accessibilité

Les humeurs sont des **données de santé sensibles** : l'app intègre consentement,
export, effacement et des modes d'accessibilité persistés. Code dans
[`src/features/gdpr/`](./src/features/gdpr) et
[`src/features/accessibility/`](./src/features/accessibility).

### Consentement

Consentement **explicite** au traitement, recueilli avant tout usage via une
porte de consentement ([`ConsentGate`](./src/features/gdpr/ConsentGate.tsx))
sur le tableau de bord, enregistré dans la table `consents`. Consultable et
**révocable** depuis le profil (section Confidentialité).

### Droit d'accès / portabilité

Export des données depuis le profil via [`/api/export`](./src/app/api/export/route.ts)
(JSON ou CSV) : profil + humeurs + tags + consentements. Authentifié et soumis à
la RLS → **uniquement les données de l'utilisateur**.

### Droit à l'effacement

Suppression du compte avec **confirmation explicite** (saisie d'un mot)
([`DeleteAccountDialog`](./src/features/gdpr/DeleteAccountDialog.tsx)). La server
action appelle la fonction Postgres `delete_current_user` (SECURITY DEFINER, ne
supprime que `auth.uid()`), dont la suppression **cascade** vers
`profiles`/`mood_entries`/`consents`. Aucune clé `service_role` n'est utilisée
côté app. L'utilisateur est ensuite déconnecté.

### Pages légales

[`/confidentialite`](./src/app/confidentialite/page.tsx),
[`/mentions-legales`](./src/app/mentions-legales/page.tsx),
[`/cgu`](./src/app/cgu/page.tsx) — contenu de base adapté à un **projet
étudiant** (sans fausse caution d'organismes), avec le disclaimer médical.
Liées depuis le profil et le footer.

### Modes d'accessibilité

**Dyslexie** (police Atkinson Hyperlegible) et **daltonisme** (palette d'humeur
Okabe-Ito) togglables depuis le profil
([`AccessibilityToggle`](./src/features/accessibility/AccessibilityToggle.tsx)),
persistés dans `profiles.accessibility_prefs` (**synchronisés entre appareils**)
avec repli `localStorage` et **script anti-flash** dans `<head>`. Les attributs
`data-font` / `data-contrast` sont lus par `globals.css`.

### Conformité WCAG AA visée

Focus pervenche visible, landmarks (`header`/`nav`/`main`/`footer`), hiérarchie
de titres, alternatives textuelles, info jamais portée par la couleur seule,
`prefers-reduced-motion`, corps ≥ 16px, cibles ≥ 44px. Audit **axe-core**
automatisé (Playwright) sur les pages clés : **0 violation critique**.

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
