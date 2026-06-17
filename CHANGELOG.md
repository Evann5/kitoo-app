# Changelog

Toutes les évolutions notables de l'application Kitoo.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/) ;
versionnage [SemVer](https://semver.org/lang/fr/).

## [1.2.0] — 2026-06-17

### Ajouté

- **Nouvelle navigation** : tab bar Accueil · Suivi · **[ + ]** · Ressources ·
  Profil. Le bouton central « + » ouvre une feuille d'actions accessible
  (humeur / test / exercice) avec focus piégé, fermeture Échap + clic extérieur
  et retour de focus. Écrans placeholder « Bientôt » pour `/suivi`, `/tests`,
  `/exercices`.

## [1.1.0] — 2026-06-17

### Modifié

- **Saisie d'humeur en molette rotative** (`MoodDial`) en remplacement du
  sélecteur à 5 boutons : rotation pointeur/tactile/clavier produisant un
  **score continu 0–100 caché** (jamais affiché ni annoncé). Le niveau 1–5 est
  désormais **dérivé** du score (colonne `mood_entries.score`, historique
  back-fillé). Ressenti qualitatif live (libellé, couleur, pose) ; `role="slider"`
  avec `aria-valuetext` = libellé d'humeur.

## [1.0.0] — 2026-06-17

Première version livrable (**MVP**).

### Ajouté

- **Authentification** email / mot de passe (Supabase Auth, `@supabase/ssr`) :
  inscription, connexion, déconnexion, sessions par cookies, protection des
  routes (middleware) et page profil.
- **Modèle de données & RLS** : `profiles`, `mood_entries`, `mood_tags`,
  `mood_entry_tags`, `resources`, `consents` ; Row-Level Security stricte
  (chacun n'accède qu'à ses données) ; migrations versionnées.
- **Mood Tracker** (`/humeur`) : saisie quotidienne « compagnon » (5 niveaux,
  tags, commentaire), 1 entrée/jour modifiable, réaction de la mascotte.
- **Tableau de bord** (`/tableau-de-bord`) : salutation, série, tendances
  (graphe accessible), badges positifs, suggestion de ressource, alerte douce
  après 3 jours « très négatif ».
- **Espace bien-être** (`/bien-etre`) : catalogue filtrable (thème + type),
  suggestions selon l'humeur, lecture intégrée.
- **RGPD** : consentement explicite, export des données (JSON/CSV), suppression
  de compte (purge complète), pages légales.
- **Accessibilité** : WCAG AA, modes dyslexie et daltonisme persistés
  (anti-flash), `prefers-reduced-motion`.
- **Qualité** : tests unitaires + e2e (Playwright) + audit axe-core, couverture
  de la logique métier, CI GitHub Actions, déploiement continu sur Vercel.

### Hors périmètre (à venir)

- **Compagnon conversationnel scénarisé** (chat) — non inclus dans ce MVP.
- Notifications/rappels, partage avec un proche, contenus enrichis (vidéo).
