# Déploiement — Kitoo app

Déploiement continu sur **Vercel**, connecté au dépôt GitHub
[`Evann5/kitoo-app`](https://github.com/Evann5/kitoo-app).

- **Production** : https://kitoo-app.vercel.app
- **Projet Vercel** : `evan-leev/kitoo-app`
- **Déploiement continu** : chaque `git push` sur `main` redéploie la production ;
  chaque branche / PR génère un déploiement _Preview_ automatique.

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
