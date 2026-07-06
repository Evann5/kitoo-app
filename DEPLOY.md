# Déploiement — Kitoo app

Déploiement continu sur **Vercel**, connecté au dépôt GitHub
[`Evann5/kitoo-app`](https://github.com/Evann5/kitoo-app).

- **Production** : https://kitoo-app.vercel.app
- **Projet Vercel** : `evan-leev/kitoo-app`
- **Déploiement continu** : chaque `git push` sur `main` redéploie la production ;
  chaque branche / PR génère un déploiement _Preview_ automatique.

## Déploiement reproductible en une commande (C4.8)

Depuis un **clone neuf** du dépôt, avec seulement Node + les comptes
Vercel/Supabase et leurs clés, une seule commande met l'app en production de
bout en bout (schéma + seed Supabase, puis mise en ligne Vercel) :

```bash
./scripts/deploy.sh          # ou : pnpm deploy
```

### Prérequis

- **Node 18+** et **pnpm** (`corepack enable` ou `npm i -g pnpm`).
- Un **projet Supabase** en région UE (Postgres + Auth + RLS) et un **projet
  Vercel** lié au dépôt GitHub. Les CLIs `supabase` et `vercel` sont utilisés
  automatiquement via `npx` s'ils ne sont pas installés globalement.
- Les clés, copiées depuis [`.env.example`](./.env.example) vers `.env.local`
  (git-ignoré) — voir le tableau plus bas. Le script lit `.env.local`, ou les
  variables déjà présentes dans l'environnement.

### Ce que fait le script (toutes les étapes sont idempotentes)

1. **CLIs** : détecte `supabase` / `vercel`, sinon bascule sur `npx --yes`.
2. **Supabase** : `supabase link` au projet (`SUPABASE_PROJECT_REF`), puis
   `supabase db push` applique les **migrations versionnées**
   (`supabase/migrations/` : tables, RLS, triggers, données de référence).
   Migrations déjà appliquées = no-op (table `supabase_migrations`).
3. **Seed** : si `SUPABASE_DB_URL` + `psql` sont disponibles, applique
   [`supabase/seed.sql`](./supabase/seed.sql) (données de démo, **idempotent** :
   `ON CONFLICT` / garde « si vide »). Sinon, rien à faire : le contenu de
   référence est déjà embarqué dans les migrations.
4. **Vercel** : rappelle les variables runtime requises, `vercel pull` (lie le
   projet + récupère la config production), puis `vercel --prod` (build côté
   Vercel).
5. **URL** : affiche l'URL de production finale.

Options : `--skip-db` (front seul), `--skip-vercel` (base seule), `--help`.

### Vérifier que le déploiement a réussi

```bash
curl -I https://kitoo-app.vercel.app                 # 200 sur l'accueil
curl -I https://kitoo-app.vercel.app/ressources      # 307 → /connexion (route protégée = middleware OK)
```

Puis, dans le navigateur : la page d'accueil s'ouvre, `/connexion` et
l'inscription fonctionnent (preuve de la connexion Supabase), et une fois
connecté les **données de démo** (ressources, exercices) s'affichent.

> **Procédure testée depuis un clone neuf.** Le schéma est intégralement décrit
> par les migrations versionnées (aucune modification manuelle de la base) ; le
> seed et le `db push` sont rejouables sans effet de bord (idempotents) ; le
> déploiement continu GitHub→Vercel reste actif (un `git push` sur `main`
> redéploie la production). Le script sert à provisionner un **nouvel**
> environnement Supabase/Vercel ou à déployer à la demande.

> **Note sur le projet de production existant.** Il a été provisionné
> initialement via l'API de gestion Supabase : les horodatages enregistrés dans
> son historique de migrations diffèrent des préfixes des fichiers locaux. Sur un
> **projet Supabase neuf**, `supabase db push` applique donc les 15 migrations
> proprement, dans l'ordre. Pour re-cibler le script sur le projet **existant**
> (déjà à jour), réconcilier l'historique une fois avec
> `supabase migration list` puis `supabase migration repair --status applied <version>`,
> ou simplement utiliser `--skip-db` (le schéma y est déjà présent). Le seed
> (`supabase/seed.sql`) reste, lui, idempotent sur tout environnement.

Le reste de ce document détaille chaque brique (mise en place initiale,
variables, réglages Auth, sécurité).

## Mise en place (one-shot)

```bash
# 1. CLI Vercel (si absente)
npm i -g vercel
vercel whoami            # sinon: vercel login

# 2. Lier le dossier au projet (nom en minuscules obligatoire)
vercel link --yes --project kitoo-app
#   → connecte aussi le dépôt GitHub (déploiement continu)
#   → si la connexion Git manque : vercel git connect

# 3. Variables d'env — placeholders Supabase sur les 3 environnements
#    (le client Supabase est tolérant : build OK avec ces valeurs)
vercel env add NEXT_PUBLIC_SUPABASE_URL      production  --value "https://placeholder.supabase.co" --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  --value "placeholder-anon-key"            --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL      development --value "https://placeholder.supabase.co" --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development --value "placeholder-anon-key"            --yes
# Pour l'environnement *preview*, la CLI v50 exige une branche en mode non
# interactif. Pour viser « toutes les branches preview », passer par l'API REST
# ou le dashboard Vercel (Settings → Environment Variables → Preview).

# 4. Premier déploiement de production
vercel --prod --yes
```

## Variables d'environnement

Renseignées avec les **vraies valeurs** du projet Supabase `kitoo-app`
(`binxcboxxrycjsqincbn`, région `eu-west-3`) sur les 3 environnements :

| Variable                        | Source                                  | Environnements                     |
| ------------------------------- | --------------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API (Project URL) | production / preview / development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (anon public) | production / preview / development |

> La clé `anon` est **publique par conception** (préfixe `NEXT_PUBLIC_`, exposée
> au navigateur) ; la sécurité repose sur les Row Level Security policies, pas sur
> son secret. La clé `service_role` ne doit **jamais** être ajoutée ici ni
> commitée (clé serveur d'administration uniquement).

En local : copier `.env.local.example` → `.env.local` et y mettre ces valeurs
(`.env.local` est git-ignoré). `vercel env pull .env.local` les récupère depuis
Vercel.

### Mettre à jour une variable

```bash
# Via la CLI (production)
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://<projet>.supabase.co" --yes
# (répéter pour preview / development) puis redéployer :
vercel --prod --yes
```

## Authentification — réglage Supabase à faire (manuel)

Le code gère **les deux cas** de confirmation email. Le comportement choisi pour
Kitoo est **confirmation désactivée** (inscription → connexion directe). Pour
l'activer côté Supabase :

> Dashboard Supabase → **Authentication → Sign In / Providers → Email** →
> décocher **« Confirm email »** (équivaut à `mailer_autoconfirm = true`).

Tant que « Confirm email » est coché (réglage par défaut d'un nouveau projet),
l'inscription affiche l'écran « vérifie ta boîte mail » au lieu de connecter
directement — c'est normal et géré par le code.

Penser aussi à **Authentication → URL Configuration** : ajouter
`https://kitoo-app.vercel.app` (Site URL) et les URLs de redirection
(`http://localhost:3000/**`, `https://kitoo-app.vercel.app/**`) pour le callback.

## Redéploiement

- **Automatique** : `git push` sur `main` → build + déploiement production.
- **Manuel** : `vercel --prod --yes`.
- **Inspecter** : `vercel inspect <url>` ou l'onglet _Deployments_ du dashboard.

## Sécurité

- **En-têtes HTTP** : [`vercel.json`](./vercel.json) ajoute `X-Content-Type-Options:
nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
strict-origin-when-cross-origin` et une `Permissions-Policy` restrictive (appliqués
  par Vercel en production).
- **RLS active** sur toutes les tables de données utilisateur ; clé `service_role`
  **jamais** utilisée côté app (la suppression de compte passe par une fonction
  Postgres `SECURITY DEFINER` limitée à `auth.uid()`).
- **Durcissement optionnel** (dashboard Supabase → Authentication → Passwords) :
  activer _Leaked password protection_ (HaveIBeenPwned). Non bloquant.

## Ressources d'aide (donnée de santé sensible)

Les tests standardisés affichent un message de soutien si l'item sensible du
PHQ-9 (idées noires) est positif, avec des **ressources d'aide à maintenir à
jour** : **3114** (ligne nationale de prévention du suicide, 24h/24), 15/112 en
urgence. À **vérifier périodiquement** (numéros, disponibilité) dans
[`SupportMessage.tsx`](./src/features/assessments/SupportMessage.tsx) — un
commentaire dans le fichier le rappelle. Aucune variable d'environnement n'est
nécessaire pour cette fonctionnalité.

Le **chatbot de soutien à règles** ([`crisis.ts`](./src/features/chat/crisis.ts))
affiche les mêmes ressources en cas de détresse détectée — à maintenir à jour au
même endroit.

Le **hub Ressources** (`/ressources`) contient des **podcasts/vidéos et liens
utiles externes** dont les URLs sont définies dans le seed
[`20260619100100_seed_resources_hub.sql`](./supabase/migrations/20260619100100_seed_resources_hub.sql).
Ces liens pointent vers des sites tiers (3114, Fil Santé Jeunes, Nightline,
Psycom, Santé publique France…) : **vérifier périodiquement** qu'ils sont
toujours valides avant et après mise en production. Les articles, eux, sont
**originaux** et hébergés en base (aucune dépendance externe).

## Région & conformité

Projet Supabase `kitoo-app` en région **`eu-west-3`** (Union européenne, RGPD).
