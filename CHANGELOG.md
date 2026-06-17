# Changelog

Toutes les évolutions notables de l'application Kitoo.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/) ;
versionnage [SemVer](https://semver.org/lang/fr/).

## [1.7.0] — 2026-06-17

### Modifié

- **Saisie d'humeur en curseur horizontal de valence** (« très désagréable » →
  « très agréable »), en **2 étapes** : (1) valence avec visuel réactif (koala +
  halo lavande, libellé qualitatif) ; (2) ressentis (tags + commentaire) puis
  enregistrement. Curseur natif `<input type="range">` (robuste, flux normal,
  responsive 320px+), score 0–100 toujours caché (`aria-valuetext` = libellé),
  accessibilité (clavier, focus, cibles ≥ 44px) et `prefers-reduced-motion`.
  Retrait de l'ancien cadran SVG « bol ». Persistance A10 inchangée.

## [1.6.1] — 2026-06-17

### Corrigé

- **Cadran d'humeur** réimplémenté en demi-cercle concave (bol ∪) dans **un seul
  SVG responsive** (`viewBox` + `width:100%`, `preserveAspectRatio`) contenant
  arc, graduations pointillées, remplissage, poignée, 5 icônes et koala+libellé :
  **alignement garanti** à toutes les tailles (fin des décalages dus aux overlays
  HTML en px de la 1.6.0). Page `/humeur` en flux normal scrollable, sans overlay
  absolu ni hauteur fixe (corrige le scroll). Score 0–100 toujours caché,
  accessibilité et `prefers-reduced-motion` conservés ; persistance A10 inchangée.

## [1.6.0] — 2026-06-17

### Modifié

- **Refonte de la saisie d'humeur** en disposition « arc » : en-tête + bandeau
  de dates (`WeekDateStrip`), titre Goodly, **icônes d'humeur en arc** (active
  mise en avant), **jauge en arc de cercle** avec poignée glissable, koala
  central synchronisé et **bouton rond de validation**. Le **score 0–100 reste
  caché** (`aria-valuetext` = libellé) ; cliquer une icône place la poignée sur
  sa zone. Persistance et logique inchangées (upsert score/level, 1/jour, RLS).
  Accessibilité (slider clavier, focus, cibles ≥ 44px) et `prefers-reduced-motion`
  respectés ; responsive 320px+.

## [1.1.0] — 2026-06-17 — Jalon « V1.1 »

Lot livrable consolidant les évolutions des versions internes 1.2 → 1.5 :
**nouvelle navigation + menu « + »**, **séparation Ressources / Exercices** avec
exercices interactifs, **tests standardisés** (PHQ-9, GAD-7, PSS-10, WHO-5) et
**journal unifié** (`/suivi`). Marqué par le tag `v1.1.0`.

### Qualité

- Couverture de tests consolidée : unitaires (scoring des 4 échelles dont PSS-10
  inversés et WHO-5 ×4, message de soutien PHQ-9 item 9, minuteur + session
  d'exercice, agrégation / filtres du journal, score d'humeur 0–100 jamais
  exposé) et e2e des nouveaux parcours (menu « + », tests, exercices, journal).
- Audit axe-core (0 violation critique) étendu aux nouvelles pages, y compris
  les détails dynamiques `/exercices/[slug]` et `/ressources/[id]`.
- Isolation RLS vérifiée par e2e pour `exercise_sessions` et `assessment_results`
  (aucun accès croisé entre comptes) ; export RGPD complété.

## [1.5.0] — 2026-06-17

### Ajouté

- **Journal unifié** (onglet Suivi, `/suivi`) : timeline chronologique
  agrégeant humeurs, sessions d'exercices et résultats de tests (visuel distinct
  par type), filtres par type/période, détail par entrée, aperçu d'évolution
  qualitatif. Agrégation via fonctions pures testables + pagination progressive.
- Le **score d'humeur 0–100 reste caché** (libellé qualitatif seul) ; tests en
  orientation avec disclaimer, entrées sensibles discrètes et soutenantes.

### Modifié

- **Export RGPD** (`/api/export`) complété avec `exercise_sessions` et
  `assessment_results`.

## [1.4.0] — 2026-06-17

### Ajouté

- **Tests standardisés** (`/tests`) : PHQ-9, GAD-7, PSS-10, WHO-5 (items FR
  validés, sources citées), scoring officiel par fonctions pures (items inversés
  PSS-10, WHO-5 ×4), résultats **orientés** (pas de diagnostic) + disclaimer.
- **Gestion sûre de l'item sensible** (PHQ-9 item 9) : message de soutien
  prioritaire avec ressources d'aide (3114), `flagged` stocké.
- Table `assessment_results` (**RLS stricte**), enregistrement via server action
  qui recalcule le score côté serveur. Historisation des passations.

## [1.3.0] — 2026-06-17

### Modifié / Ajouté

- **Séparation Ressources / Exercices**. `resources` recentré sur les contenus à
  lire (article / avis / conseil ; les anciens « exercice » reclassés). Espace
  Ressources déplacé sur `/ressources`.
- **Exercices interactifs** : nouvelles tables `exercises` et `exercise_sessions`
  (RLS stricte), catalogue `/exercices` et lecteur `/exercices/[slug]` avec
  minuteur guidé (phases + `aria-live`, reduced-motion, pause/arrêt). Chaque
  session est historisée (`completed` true/false) via server action.

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
