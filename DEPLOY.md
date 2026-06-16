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

Actuellement renseignées en **placeholders** (clairement factices, non secrètes) :

| Variable                        | Valeur actuelle (placeholder)     | Environnements                     |
| ------------------------------- | --------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://placeholder.supabase.co` | production / preview / development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `placeholder-anon-key`            | production / preview / development |

> Aucun secret n'est commité. La clé `service_role` de Supabase ne doit **jamais**
> être ajoutée ici ni commitée (clé serveur uniquement, hors `NEXT_PUBLIC_*`).

### Renseigner Supabase en A2

Une fois le projet Supabase créé :

```bash
# Remplacer les placeholders par les vraies valeurs (--force pour écraser)
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://<projet>.supabase.co" --yes
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "<clé anon>" --yes
# (répéter pour preview / development)

# Redéployer pour prendre en compte les nouvelles valeurs
vercel --prod --yes
```

En local, copier `.env.local.example` → `.env.local` et y mettre les vraies
valeurs (`.env.local` est git-ignoré). `vercel env pull .env.local` récupère aussi
les variables depuis Vercel.

## Redéploiement

- **Automatique** : `git push` sur `main` → build + déploiement production.
- **Manuel** : `vercel --prod --yes`.
- **Inspecter** : `vercel inspect <url>` ou l'onglet _Deployments_ du dashboard.
