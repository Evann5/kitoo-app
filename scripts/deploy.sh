#!/usr/bin/env bash
#
# Kitoo — script de déploiement reproductible (Supabase + Vercel).
# Livrable C4.8. Depuis un clone vierge + les clés (cf. .env.example), une
# seule commande met l'application en production de bout en bout :
#
#   ./scripts/deploy.sh
#
# Étapes (toutes IDEMPOTENTES — rejouables sans effet de bord) :
#   1. Vérifie/installe les CLIs requis (supabase, vercel) — via npx si absents.
#   2. Applique le schéma Supabase (migrations versionnées) + le seed de démo.
#   3. Rappelle les variables d'environnement requises.
#   4. Déploie le front sur Vercel (production).
#   5. Affiche l'URL de production finale.
#
# Le déploiement continu GitHub→Vercel (push = redéploiement) reste actif :
# ce script sert à (re)provisionner un environnement ou à déployer à la demande.
#
# Options :
#   --skip-db       Ne pas toucher à Supabase (déploie seulement le front).
#   --skip-vercel   Ne pas déployer sur Vercel (applique seulement la base).
#   -h | --help     Affiche cette aide.

set -euo pipefail

# ── Utilitaires d'affichage ──────────────────────────────────────────────────
bold() { printf '\033[1m%s\033[0m\n' "$1"; }
info() { printf '  \033[36m→\033[0m %s\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
err()  { printf '  \033[31m✗ %s\033[0m\n' "$1" >&2; }

# Se placer à la racine du dépôt (le script est dans scripts/).
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── Options ──────────────────────────────────────────────────────────────────
SKIP_DB=0
SKIP_VERCEL=0
for arg in "$@"; do
  case "$arg" in
    --skip-db) SKIP_DB=1 ;;
    --skip-vercel) SKIP_VERCEL=1 ;;
    -h|--help)
      sed -n '2,30p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) err "Option inconnue : $arg"; exit 1 ;;
  esac
done

# ── Chargement des variables d'environnement ─────────────────────────────────
# Priorité : variables déjà présentes dans l'environnement, sinon .env.local.
# Aucun secret n'est écrit ni committé ; .env* est ignoré par git.
if [ -f .env.local ]; then
  info "Chargement de .env.local"
  set -a; . ./.env.local; set +a
fi

# Vérifie qu'une variable est définie, sinon message clair et sortie.
require_var() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    err "Variable requise manquante : $name (voir .env.example)"
    exit 1
  fi
}

# ── Résolution des CLIs (binaire installé, sinon npx) ────────────────────────
resolve_cli() {
  # $1 = nom du binaire, $2 = paquet npx à utiliser en repli.
  if command -v "$1" >/dev/null 2>&1; then
    echo "$1"
  else
    warn "CLI '$1' absent : utilisation de 'npx --yes $2'" >&2
    echo "npx --yes $2"
  fi
}

bold "Kitoo — déploiement (Supabase + Vercel)"

# ── 1 & 2. Supabase : migrations versionnées + seed ──────────────────────────
if [ "$SKIP_DB" -eq 0 ]; then
  bold "1) Base de données Supabase"
  require_var SUPABASE_PROJECT_REF

  SUPABASE_CLI="$(resolve_cli supabase supabase)"
  # Jeton d'accès CLI (sinon `supabase login` interactif).
  if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
    export SUPABASE_ACCESS_TOKEN
  fi

  # Lier le dépôt au projet distant (idempotent).
  info "Liaison au projet $SUPABASE_PROJECT_REF"
  if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
    $SUPABASE_CLI link --project-ref "$SUPABASE_PROJECT_REF" \
      --password "$SUPABASE_DB_PASSWORD"
  else
    $SUPABASE_CLI link --project-ref "$SUPABASE_PROJECT_REF"
  fi

  # Appliquer les migrations en attente (déjà appliquées = no-op).
  info "Application des migrations (supabase/migrations/)"
  if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
    $SUPABASE_CLI db push --password "$SUPABASE_DB_PASSWORD"
  else
    $SUPABASE_CLI db push
  fi
  ok "Schéma, RLS et triggers à jour"

  # Seed de démonstration (idempotent). Appliqué via psql si la chaîne de
  # connexion est fournie ; sinon rappel (le contenu de référence est déjà
  # embarqué dans les migrations, donc db push suffit à peupler une base neuve).
  if [ -n "${SUPABASE_DB_URL:-}" ] && command -v psql >/dev/null 2>&1; then
    info "Application du seed de démo (supabase/seed.sql)"
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql >/dev/null
    ok "Seed de démonstration appliqué"
  else
    warn "Seed non appliqué via psql (SUPABASE_DB_URL/psql absents)."
    warn "Les données de référence sont déjà incluses dans les migrations."
  fi
else
  warn "Étape Supabase ignorée (--skip-db)"
fi

# ── 3 & 4. Vercel : rappel des variables + déploiement production ────────────
if [ "$SKIP_VERCEL" -eq 0 ]; then
  bold "2) Front Vercel"
  require_var NEXT_PUBLIC_SUPABASE_URL
  require_var NEXT_PUBLIC_SUPABASE_ANON_KEY
  info "Variables runtime attendues sur Vercel (Production, Preview, Development) :"
  info "  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
  info "  (la clé service_role n'est JAMAIS utilisée ni déployée)"

  VERCEL_CLI="$(resolve_cli vercel vercel)"

  # Lier le dossier au projet Vercel et récupérer la config de production.
  info "Liaison / récupération de la configuration Vercel"
  $VERCEL_CLI pull --yes --environment=production

  # Déploiement de production (build côté Vercel). Idempotent : chaque appel
  # produit un déploiement équivalent depuis le même commit.
  info "Déploiement en production"
  DEPLOY_URL="$($VERCEL_CLI --prod --yes)"
  ok "Déployé : $DEPLOY_URL"
else
  warn "Étape Vercel ignorée (--skip-vercel)"
fi

# ── 5. URL de production finale ──────────────────────────────────────────────
bold "Terminé."
PROD_URL="${PRODUCTION_URL:-${DEPLOY_URL:-https://kitoo-app.vercel.app}}"
info "URL de production : $PROD_URL"
info "Vérifier : la page d'accueil s'ouvre, /connexion fonctionne, les données"
info "de démo (ressources, exercices) s'affichent une fois connecté."
