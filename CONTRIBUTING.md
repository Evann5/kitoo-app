# Contribuer à Kitoo

Merci de contribuer ! Ce guide résume les conventions du dépôt.

## Pré-requis

- **Node 20+** et **pnpm 11+**
- Un fichier `.env.local` (cf. [`README`](./README.md#variables-denvironnement))

```bash
pnpm install
pnpm dev
```

## Stratégie de branches

- `main` : branche stable, déployée en continu sur Vercel. Toujours verte.
- Travaille sur une branche dédiée : `feat/...`, `fix/...`, `chore/...`,
  `test/...`, `docs/...`, puis ouvre une **Pull Request** vers `main`.
- La CI (lint + tests + build) doit passer avant merge.

## Convention de commits

[Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>: <résumé court à l'impératif>

<corps optionnel : le pourquoi, les détails>
```

Types courants : `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`.

## Ajouter une fonctionnalité

1. **Données** : si besoin, ajoute une migration dans
   [`supabase/migrations/`](./supabase/migrations) (activer la RLS sur toute
   table de données utilisateur, policies `auth.uid() = user_id`). Régénère les
   types (`src/lib/supabase/types.ts`).
2. **Logique** : place la logique métier **pure et testable** dans des helpers
   (`src/features/<domaine>/`), avec des tests unitaires Vitest.
3. **UI** : compose avec les primitives du design system
   (`src/components/ui`), respecte l'accessibilité (labels, focus, `aria-*`,
   corps ≥ 16px, cibles ≥ 44px) et `prefers-reduced-motion`.
4. **Sécurité** : opérations sensibles via server actions authentifiées ;
   jamais la clé `service_role` côté client ; aucun secret commité.
5. **Tests** : unitaires (logique + composants) et, si pertinent, un scénario
   e2e Playwright. Vise ≥ 80 % de couverture sur la logique métier.

## Qualité (à lancer avant de pousser)

```bash
pnpm lint
pnpm test:coverage
pnpm build
pnpm test:e2e   # local : crée des comptes éphémères (nettoyés)
```

Le code est formaté avec Prettier : `pnpm format`.
