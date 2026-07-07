# Procès-verbal de recettage — Kitoo (BC04 · C4.3)

Ce document constitue le **procès-verbal de recettage** de l'application Kitoo :
il décrit la stratégie de tests, la couverture des cas d'utilisation, et reporte
le **résultat réel** de l'exécution des suites automatisées.

## En-tête

| Champ                      | Valeur                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Projet**                 | Kitoo — application de prévention en santé mentale (MVP)                                                      |
| **Dépôt**                  | https://github.com/Evann5/kitoo-app                                                                           |
| **Version / commit testé** | branche `main`, commit `c36da4d` (+ fiabilisation d'un test a11y)                                             |
| **Date du recettage**      | 7 juillet 2026                                                                                                |
| **Environnement de test**  | Node v24.3.0 · macOS (darwin) · exécution locale, base Supabase `eu-west-3`                                   |
| **Outils**                 | Vitest 2.1 (+ V8 coverage) · Playwright 1.47 (Chromium) · axe-core 4.11 (`@axe-core/playwright`)              |
| **Périmètre**              | Auth, humeur, tests standardisés, exercices, ressources, RGPD, accessibilité, sécurité (RLS), chat de soutien |

## Stratégie de tests

La validation repose sur **trois niveaux** complémentaires, tous automatisés et
rejouables (`pnpm test:coverage`, `pnpm test:e2e`) :

1. **Tests unitaires & composants (Vitest + Testing Library, jsdom).**
   Logique métier **pure** (calcul de série, alerte de soutien, scoring des
   échelles PHQ-9/GAD-7/PSS-10/WHO-5, agrégation du journal, filtres ressources,
   moteur du chat, mapping score→libellé, validation, préférences a11y) et
   **composants clés** (formulaires, molette/curseur d'humeur, tab bar, graphe,
   consentement, suppression de compte).

2. **Tests de bout en bout (Playwright, navigateur Chromium).**
   Les **parcours réels** de l'utilisateur, depuis un compte éphémère créé à la
   volée : inscription, humeur, test standardisé, exercice, ressources, journal,
   RGPD (consentement/export/suppression), protection des routes privées et
   **isolation RLS** entre deux comptes.

3. **Accessibilité (axe-core, intégré aux e2e).**
   Audit automatique **0 violation critique** sur les pages publiques et
   privées, complété par des vérifications clavier / `aria` dans les tests de
   composants.

> Les e2e créent des comptes de test **éphémères** (emails `+e2e-…`, supprimés
> après exécution) et n'altèrent jamais les comptes réels.

## Tableau de recettage

Légende **Type** : `unit` (Vitest) · `e2e` (Playwright) · `a11y` (axe-core).
Tous les cas ci-dessous sont **automatisés** et rejouables.

| ID   | Cas d'utilisation               | Scénario                                                        | Résultat attendu                                                        | Obtenu | Type       |
| ---- | ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ---------- |
| T-01 | Inscription                     | Créer un compte (email + mot de passe valides)                  | Compte créé, redirection vers le tableau de bord                        | ✅ OK  | e2e        |
| T-02 | Connexion                       | Ouvrir l'écran de connexion, formulaire labelisé et fonctionnel | Formulaire accessible, session ouverte                                  | ✅ OK  | e2e        |
| T-03 | Déconnexion                     | Se déconnecter depuis une session active                        | Session fermée ; les routes privées redemandent la connexion            | ✅ OK  | e2e        |
| T-04 | Validation des entrées          | Inscription avec mot de passe trop court / email invalide       | Erreurs client bienveillantes, pas de soumission                        | ✅ OK  | e2e + unit |
| T-05 | Protection des routes           | Visiteur non connecté ouvre une route privée                    | Redirection vers `/connexion?redirect=…`                                | ✅ OK  | e2e + unit |
| T-06 | Saisie d'humeur                 | Noter l'humeur du jour                                          | Entrée enregistrée et affichée                                          | ✅ OK  | e2e        |
| T-07 | Une seule humeur par jour       | Rouvrir l'app le même jour après une saisie                     | Formulaire préchargé, CTA « Modifier » (pas de doublon)                 | ✅ OK  | e2e + unit |
| T-08 | Score d'humeur caché            | Consulter l'humeur                                              | Seul le **libellé** est affiché ; l'échelle 0–100 reste masquée         | ✅ OK  | unit       |
| T-09 | Alerte douce de soutien         | 3 jours consécutifs au niveau « très négatif »                  | Nudge de soutien déclenché (à 3 jours, pas à 2)                         | ✅ OK  | unit       |
| T-10 | Passer un test standardisé      | Répondre au WHO-5 et valider                                    | Résultat en **orientation** (libellé), avec disclaimer, sans score brut | ✅ OK  | e2e + unit |
| T-11 | Scoring des échelles            | PHQ-9, GAD-7, PSS-10 (items inversés 4/5/7/8), WHO-5 (×4)       | Scores et sévérités calculés correctement                               | ✅ OK  | unit       |
| T-12 | Item sensible (PHQ-9 item 9)    | Réponse > 0 à l'item « idées noires »                           | Flag activé → message de soutien + ressources, sans diagnostic          | ✅ OK  | unit       |
| T-13 | Faire un exercice               | Lancer un exercice, dérouler le minuteur et les contrôles       | Session enregistrée, contrôles fonctionnels                             | ✅ OK  | e2e + unit |
| T-14 | Consulter/filtrer ressources    | Filtrer par format ET thème, ouvrir un article                  | Filtres cumulables, lecture interne de l'article                        | ✅ OK  | e2e + unit |
| T-15 | RGPD — consentement             | Accepter le consentement à l'entrée                             | Consentement enregistré et persistant après rechargement                | ✅ OK  | e2e + unit |
| T-16 | RGPD — export des données       | Appeler `/api/export` authentifié                               | Fichier JSON de portabilité téléchargeable (pièce jointe)               | ✅ OK  | e2e        |
| T-17 | RGPD — suppression de compte    | Supprimer son compte                                            | Données effacées, déconnexion, accès révoqué                            | ✅ OK  | e2e        |
| T-18 | Accessibilité — pages publiques | Audit axe des pages publiques                                   | **0 violation critique**                                                | ✅ OK  | a11y       |
| T-19 | Accessibilité — pages privées   | Audit axe des pages privées                                     | **0 violation critique**                                                | ✅ OK  | a11y       |
| T-20 | Accessibilité — préférences     | Activer le mode dyslexie, recharger la page                     | Police adaptée appliquée et **persistante** ; réglages au clavier       | ✅ OK  | e2e + unit |
| T-21 | Chat de soutien                 | Envoyer un message, puis un message de détresse                 | Réponse contextuelle ; détresse → ressources d'urgence (3114)           | ✅ OK  | e2e + unit |
| T-22 | Sécurité — isolation RLS        | Deux comptes distincts tentent d'accéder aux données de l'autre | Aucun accès croisé (Row-Level Security)                                 | ✅ OK  | e2e        |
| T-23 | Journal unifié                  | Humeur + exercice + test réalisés                               | Les trois apparaissent dans le suivi (timeline)                         | ✅ OK  | e2e + unit |

**Bilan : 23 / 23 cas d'utilisation validés (OK), 0 échec.**

## Rapport d'exécution (résultats réels)

### Tests unitaires et composants — `pnpm test:coverage`

```
 Test Files  30 passed (30)
      Tests  167 passed (167)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |    97.8 |     90.3 |   95.55 |    97.8 |
-------------------|---------|----------|---------|---------|
```

- **167 tests unitaires / composants**, **100 % réussite** (30 fichiers).
- **Couverture** (logique métier pure ciblée par `coverage.include`) :
  **97.8 % lignes**, **90.3 % branches**, **95.55 % fonctions**, **97.8 %
  instructions** — au-dessus des seuils CI (lignes 80 % / fonctions 80 % /
  branches 75 %).

### Tests end-to-end et accessibilité — `pnpm test:e2e`

```
Running 19 tests using … workers
  19 passed (25.0s)
```

- **19 scénarios end-to-end** (Playwright / Chromium), **100 % réussite**,
  **0 flaky**.
- Inclut l'**audit d'accessibilité axe-core** (`a11y.spec.ts`) : **0 violation
  critique** sur les pages publiques comme privées.
- Couvre les parcours : authentification, humeur, tests standardisés,
  exercices, ressources, journal, RGPD (consentement/export/suppression),
  chat de soutien, urgence, navigation, **isolation RLS** et protection des
  routes privées.

### Intégration continue

Le pipeline [GitHub Actions](../.github/workflows/ci.yml) rejoue à chaque push /
PR sur `main` : `install → lint → test:coverage → build`. Statut du commit
testé : **succès**.

## Conclusion

- **Fonctionnalités validées** : l'ensemble des cas d'utilisation clés du
  périmètre (auth, humeur avec règle « une par jour » et score caché, alerte
  douce de soutien, tests standardisés avec scoring correct et gestion de l'item
  sensible, exercices, ressources filtrables, RGPD complet, accessibilité sans
  violation critique, sécurité par RLS) sont **couverts et passants**.
- **Points ouverts** : aucun blocant. Les avertissements non bloquants connus
  sont documentés (protection « mots de passe compromis » Supabase optionnelle ;
  dépréciation Node 20 côté runners GitHub). Un test de persistance de
  préférence d'accessibilité a été fiabilisé (attente de la validation serveur
  avant rechargement) pour supprimer une intermittence propre au test.
- **Reproductibilité** : les suites sont rejouables localement et en CI ; ce PV
  reflète l'exécution réelle des commandes ci-dessus (aucun résultat fabriqué).
