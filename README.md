# Kitoo — application (MVP)

Application **Kitoo** : suivi d'humeur (Mood Tracker), statistiques et espace
bien-être, avec authentification email / mot de passe.

**Production** : https://kitoo-app.vercel.app — déployée en continu sur Vercel
(chaque `git push` sur `main` redéploie automatiquement). Détails et procédure :
[`DEPLOY.md`](./DEPLOY.md).

Le périmètre actuel (**v1.1**) couvre : authentification (email/mot de passe),
saisie quotidienne d'humeur « compagnon », tableau de bord avec tendances et
badges, navigation par tab bar + menu « + », **ressources** à lire et
**exercices** interactifs (minuteur guidé), **tests standardisés** (PHQ-9,
GAD-7, PSS-10, WHO-5) en orientation, **journal unifié** (`/suivi`), et
conformité RGPD + accessibilité (modes dyslexie / daltonisme). **À venir** : le
compagnon conversationnel scénarisé (chat), les rappels / notifications.
Historique : [`CHANGELOG.md`](./CHANGELOG.md).
Dépôt **séparé** du site vitrine ; le design system Kitoo a été importé puis
câblé (cf. [`IMPORT.md`](./IMPORT.md)).

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
cp .env.local.example .env.local   # renseigner les clés Supabase (cf. ci-dessous)
pnpm dev                           # http://localhost:3000
```

Les clients Supabase sont **tolérants à l'absence de variables d'env** : le build
fonctionne sans `.env.local` (les vraies clés sont nécessaires pour l'auth et les
données).

## Scripts

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Serveur de développement            |
| `pnpm build`         | Build de production                 |
| `pnpm start`         | Sert le build de production         |
| `pnpm lint`          | ESLint                              |
| `pnpm format`        | Prettier (écriture)                 |
| `pnpm format:check`  | Prettier (vérification)             |
| `pnpm test`          | Tests unitaires/composants (Vitest) |
| `pnpm test:coverage` | Tests + rapport de couverture       |
| `pnpm test:e2e`      | Tests end-to-end (Playwright)       |

## Tests & qualité

```bash
pnpm lint
pnpm test:coverage   # unitaires + couverture (seuils ci-dessous)
pnpm test:e2e        # parcours réels (nécessite .env.local Supabase)
pnpm build
```

- **Unitaires (Vitest + Testing Library)** : logique métier (série, alerte
  3 jours, 1 entrée/jour, suggestion selon humeur, filtres bien-être,
  mapping score→humeur, validation, `safeRedirect`, préférences a11y) et
  composants clés (molette `MoodDial`, formulaires, graphe, tab bar / menu « + »,
  consentement, suppression de compte).
- **Couverture** : mesurée sur la **logique métier pure** (cf. `coverage.include`
  dans [`vitest.config.ts`](./vitest.config.ts)), seuils **lignes 80 % /
  fonctions 80 % / branches 75 %** (actuellement ~96 % lignes). Rapport HTML dans
  `coverage/`.
- **End-to-end (Playwright)** : parcours complet
  ([`parcours.spec.ts`](./tests/e2e/parcours.spec.ts)), protection des routes,
  modes d'accessibilité ([`gdpr.spec.ts`](./tests/e2e/gdpr.spec.ts)), **isolation
  RLS entre deux comptes** ([`securite-rls.spec.ts`](./tests/e2e/securite-rls.spec.ts))
  et **audit axe-core** (0 violation critique,
  [`a11y.spec.ts`](./tests/e2e/a11y.spec.ts)).

> Les e2e créent des **comptes de test éphémères** (emails `+e2e-…`, nettoyés).
> Ils utilisent le Supabase de `.env.local` ; ne committe jamais de secret ni de
> compte réel. La confirmation email doit être désactivée côté Supabase.

**Audit Lighthouse** (prod, page d'accueil) : Performance 99 · Accessibilité 95 ·
Best Practices 100 · SEO 100.

## Intégration continue

[GitHub Actions](./.github/workflows/ci.yml) sur chaque push / PR vers `main` :
`install → lint → test:coverage → build`. Les e2e (Supabase requis, comptes
éphémères) se lancent **en local** ; pour les activer en CI, fournir
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` en _GitHub Actions
secrets_.

## Arborescence

```
src/
  app/                  routes (App Router) : auth, humeur, tableau-de-bord,
                        ressources, exercices, suivi, profil, légales, api/export
  components/
    ui/                 primitives (Button, Card, Badge, Tag, Container…)
    illustrations/      Illustration, Mascot, Blob
    motion/             Reveal, Stagger
    layout/             AppShell, TabBar, Footer, LegalShell
  features/             logique + UI par domaine
    auth/  mood/  dashboard/  wellbeing/  exercises/  gdpr/  accessibility/
  lib/
    supabase/           client.ts (browser) + server.ts + types.ts
    auth.ts  validation.ts  moods.ts  cn.ts  illustrations.ts  motion.ts
  hooks/                useReducedMotion
middleware.ts           rafraîchissement de session + protection des routes
supabase/migrations/    schéma + RLS + seeds (SQL versionné)
design-system/          tokens, fonts, assets, guidelines, reference (hors build)
tests/
  unit/                 tests Vitest
  e2e/                  tests Playwright (+ axe-core)
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

| Route              | Accès  | Rôle                                                  |
| ------------------ | ------ | ----------------------------------------------------- |
| `/inscription`     | public | création de compte (email, mot de passe + confirm)    |
| `/connexion`       | public | connexion                                             |
| `/auth/callback`   | public | échange du code de confirmation (si activée)          |
| `/profil`          | privé  | compte, confidentialité (RGPD), accessibilité         |
| `/tableau-de-bord` | privé  | accueil : humeur du jour, série, tendances            |
| `/humeur`          | privé  | saisie / modification de l'humeur du jour             |
| `/ressources`      | privé  | contenus à lire (+ lecture `/ressources/[id]`)        |
| `/exercices`       | privé  | exercices interactifs (+ lecteur `/exercices/[slug]`) |
| `/tests`           | privé  | tests standardisés (+ passation `/tests/[scale]`)     |
| `/suivi`           | privé  | journal unifié : timeline + filtres + évolution       |

La protection est assurée par [`middleware.ts`](./middleware.ts) (rafraîchit la
session et redirige : non connecté → `/connexion`, déjà connecté hors des écrans
d'auth → `/tableau-de-bord`), doublée du helper serveur
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

## Navigation

Dans l'app connectée (routes privées uniquement), une **tab bar** mobile-first
([`TabBar`](./src/components/layout/TabBar.tsx)) :

| Zone       | Destination                     |
| ---------- | ------------------------------- |
| Accueil    | `/tableau-de-bord`              |
| Suivi      | `/suivi`                        |
| **« + »**  | feuille d'actions rapides (FAB) |
| Ressources | `/ressources`                   |
| Profil     | `/profil` (avatar / initiale)   |

L'onglet actif porte `aria-current="page"`. Le **bouton central « + »** (FAB
pervenche) ouvre [`AddMenu`](./src/components/layout/AddMenu.tsx), une feuille
d'actions : **Noter mon humeur** (`/humeur`), **Passer un test** (`/tests`),
**Faire un exercice** (`/exercices`).

**Accessibilité du menu** : `aria-haspopup`/`aria-expanded` sur le « + » ;
feuille `role="dialog"` `aria-modal` avec **focus piégé** (Tab cyclique),
fermeture par **Échap** et **clic extérieur**, et **retour du focus** au « + ».
Ouverture animée neutralisée sous `prefers-reduced-motion`.

> Les écrans **Suivi**, **Tests** et **Exercices** sont des placeholders
> « Bientôt » (construits ultérieurement). « Ressources » réutilise le catalogue
> bien-être existant.

## Mood Tracker

Saisie d'humeur quotidienne (route privée [`/humeur`](./src/app/humeur/page.tsx)),
expérience « compagnon » douce. Code dans
[`src/features/mood/`](./src/features/mood).

### Saisie « bol » dans un SVG unique (score 0–100 caché)

La page `/humeur` est une **colonne en flux normal** (en-tête → bandeau de
semaine → titre → cadran → bouton rond → tags → commentaire), sans overlay ni
scroll imbriqué. Le cadran ([`MoodDial`](./src/features/mood/MoodDial.tsx)) est
un **demi-cercle concave vers le haut (bol ∪)** dessiné **entièrement dans un
seul `<svg>` responsive** (`viewBox` fixe + `width:100%`, `height:auto`,
`preserveAspectRatio`). Arc track, graduations pointillées, remplissage
pervenche, poignée, **5 icônes d'humeur** et **koala + libellé** partagent le
même système de coordonnées — d'où un **alignement garanti à toutes les tailles**
(320px → desktop). C'est le motif retenu pour corriger les décalages de la
version précédente (icônes positionnées en `px` absolus au-dessus du SVG).

Géométrie : centre du cercle au-dessus, arc = moitié basse ; gauche = très
négatif (score 0), bas = neutre (~50), droite = très positif (100). La poignée
(pointeur, tactile ou clavier) produit un **score continu 0–100 caché** (jamais
affiché, ni dans `aria-valuetext`) ; activer une icône pose la poignée sur le
centre de sa zone. Seul le **ressenti qualitatif** est montré (libellé, couleur,
pose du koala). Accessibilité : `role="slider"` clavier (flèches, Home/End),
icônes `role="button"` activables, focus pervenche, cibles ≥ 44px ; transitions
neutralisées sous `prefers-reduced-motion`. Le **bouton rond de validation** est
un élément HTML en flux, sous le SVG.

Le `score` est stocké dans `mood_entries.score` (`smallint` 0–100) ; le `level`
(1–5) en est **dérivé** côté serveur (`scoreToLevel`) pour les stats/graphes :

| Score  | Niveau | Humeur       | Couleur   | Pose koala         |
| ------ | ------ | ------------ | --------- | ------------------ |
| 0–19   | 1      | Très négatif | `#FF595E` | `kitoo-crying`     |
| 20–39  | 2      | Négatif      | `#FF8C42` | `kitoo-classic`\*  |
| 40–59  | 3      | Neutre       | `#E0E0E0` | `kitoo-classic`    |
| 60–79  | 4      | Positif      | `#A8E6CF` | `kitoo-soda`       |
| 80–100 | 5      | Très positif | `#FFD93D` | `kitoo-sunglasses` |

\* `TODO` pose « légèrement triste » quand l'asset existera.

### Règles métier

- **1 entrée par jour** par utilisateur (upsert sur `(user_id, entry_date)`),
  modifiable jusqu'à 23h59 le jour même. Les jours passés sont consultables mais
  non modifiables.
- La **date, l'`user_id` et le `level` sont calculés côté serveur** (jamais le
  client) ; le **score est validé en 0–100** avant écriture, via la server
  action [`saveMood`](./src/features/mood/actions.ts).
- Historique existant **back-fillé** (score au centre du bucket du `level`).

### Accessibilité

Molette = `role="slider"` opérable au **clavier** (flèches, Home/End,
PageUp/Down) et au pointeur/tactile ; `aria-valuetext` = **libellé d'humeur**
(jamais le nombre) ; focus pervenche visible. Chips de tags `aria-pressed`,
formulaire labelisé, corps ≥ 16px. Transitions neutralisées sous
`prefers-reduced-motion`.

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

## Ressources

Contenus **à lire** (article / avis / conseil), séparés des exercices. Routes
privées [`/ressources`](./src/app/ressources/page.tsx) et
[`/ressources/[id]`](./src/app/ressources/[id]/page.tsx). Code dans
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

## Exercices

Exercices **interactifs** (respiration, ancrage…) avec minuteur. Routes privées
[`/exercices`](./src/app/exercices/page.tsx) (catalogue) et
[`/exercices/[slug]`](./src/app/exercices/[slug]/page.tsx) (lecteur). Code dans
[`src/features/exercises/`](./src/features/exercises).

### Modèle de données

- `exercises` (référence, lecture seule) : `slug`, `title`, `category`,
  `description`, `duration_sec`, `theme`, `mood_levels`, et `steps` (jsonb) qui
  décrit le minuteur : `{ cycles, phases:[{ label, seconds }] }`.
- `exercise_sessions` (données perso, **RLS stricte**) : historique des sessions
  jouées (`started_at`, `completed_at`, `duration_sec`, `completed`).

### Lecteur interactif

[`ExercisePlayer`](./src/features/exercises/ExercisePlayer.tsx) enchaîne les
phases (cercle de guidage qui se dilate/contracte), avec pause/reprise et arrêt.
À la **fin** une session `completed=true` est enregistrée ; à l'**arrêt**,
`completed=false` avec le temps écoulé — via la server action
[`recordExerciseSession`](./src/features/exercises/actions.ts) (authentifiée,
RLS).

### Accessibilité

Animation du guidage **neutralisée sous `prefers-reduced-motion`** (le libellé de
phase + le compte à rebours suffisent) ; phases annoncées via `aria-live` ;
contrôles au clavier, cibles ≥ 44px.

## Tests standardisés

Questionnaires validés accessibles via `/tests` et `/tests/[scale]`. Code dans
[`src/features/assessments/`](./src/features/assessments). Principe : ces tests
**orientent, ne diagnostiquent pas** (disclaimer sur l'intro et le résultat).

### Échelles, sources & scoring

| Échelle | Items    | Score                                       | Sources (versions FR, instruments libres)          |
| ------- | -------- | ------------------------------------------- | -------------------------------------------------- |
| PHQ-9   | 9 (0–3)  | 0–27                                        | Spitzer/Kroenke/Williams — Pfizer (domaine public) |
| GAD-7   | 7 (0–3)  | 0–21                                        | Spitzer/Kroenke/Williams/Löwe — Pfizer             |
| PSS-10  | 10 (0–4) | 0–40 (items **4,5,7,8 inversés**)           | Cohen, S. (1983)                                   |
| WHO-5   | 5 (0–5)  | brut **×4** → 0–100 (présenté positivement) | OMS (1998)                                         |

Le scoring est implémenté par des **fonctions pures testables**
([`scales.ts`](./src/features/assessments/scales.ts), `computeResult`) ;
le serveur **recalcule** score/sévérité/flag à l'enregistrement (jamais de
confiance au client).

### Item sensible (PHQ-9, item 9)

Si l'item « idées noires » est positif (> 0), un message de soutien
([`SupportMessage`](./src/features/assessments/SupportMessage.tsx)) s'affiche
**en priorité** (jamais un score sec), avec des ressources d'aide à jour
(**3114** — ligne nationale de prévention du suicide, 24h/24 ; 15/112 en
urgence) ; `flagged=true` est stocké. Ton soutenant, jamais alarmant.

> Ressources d'aide à vérifier/maintenir à jour (voir le commentaire dans
> `SupportMessage.tsx`).

### Données & accessibilité

Résultats dans `assessment_results` (**RLS stricte** : chacun ne lit que les
siens), écriture via server action authentifiée. Questionnaires en
`fieldset`/`legend` + radios (clavier), progression annoncée (`aria-live`),
possibilité de quitter sans enregistrer, corps ≥ 16px.

## Journal / Suivi

L'onglet **Suivi** (`/suivi`) réunit en une **timeline unifiée** les trois
sources d'événements de l'utilisateur. Code dans
[`src/features/journal/`](./src/features/journal).

- **Sources agrégées** : humeurs (`mood_entries`), sessions d'exercices
  (`exercise_sessions`) et résultats de tests (`assessment_results`), fusionnées
  et triées du plus récent au plus ancien par
  [`mergeAndSort`](./src/features/journal/aggregate.ts) (fonctions **pures et
  testables**). Lecture **sous RLS** dans
  [`queries.ts`](./src/features/journal/queries.ts) — chacun ne voit que ses
  données — avec un visuel distinct par type.
- **Confidentialité du score d'humeur** : le score continu **0–100 reste caché**
  — une entrée d'humeur ne porte que son **libellé qualitatif** (« Très bien »…),
  jamais le nombre. Les résultats de tests, eux, sont assumés (libellé de
  sévérité + score officiel), présentés en **orientation** (pas de diagnostic)
  avec disclaimer ; une entrée « sensible » (item 9 du PHQ-9, cf. A13) reste
  discrète et soutenante, avec ressources d'aide dans le détail.
- **Filtres** : par type (humeur / exercice / test) et par période
  (semaine / mois / tout), au clavier (`aria-pressed`) ; état vide chaleureux
  par filtre et à l'ouverture (nouvel utilisateur).
- **Évolution** : aperçu qualitatif — courbe d'humeur (réutilise
  `MoodTrendChart`, avec alternative textuelle), récap d'exercices, évolution
  des scores de tests. Pagination progressive (« Voir plus ») de la timeline.
- **Export RGPD** : l'export (A7, `/api/export`) inclut désormais aussi
  `exercise_sessions` et `assessment_results` dans le JSON de portabilité.

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

### `design-system/reference/` — hors build

Les fichiers `design-system/reference/tailwind.config.ts` + `globals.css` (et tout
`design-system/`) sont **conservés comme source de fusion** mais exclus de la
compilation et du lint (`tsconfig.json` `exclude`, `eslint.config.mjs`
`globalIgnores`) — ils ne sont jamais intégrés au bundle.
