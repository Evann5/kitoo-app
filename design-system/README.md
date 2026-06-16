# Design System — Kitoo

Ce dossier accueille **manuellement** les fichiers du design system Kitoo, à déposer
**avant l'étape suivante** du développement du site vitrine. Tant que ces fichiers
ne sont pas présents, ne code aucune section ni style métier.

## Où déposer quoi

### `tokens/`

Les variables CSS du design system :

| Fichier          | Contenu attendu                           |
| ---------------- | ----------------------------------------- |
| `colors.css`     | Palette de couleurs (variables CSS)       |
| `typography.css` | Échelle typographique, familles, graisses |
| `spacing.css`    | Espacements, rayons, breakpoints          |
| `base.css`       | Reset / styles de base globaux            |
| `fonts.css`      | Déclarations `@font-face`                 |

### `fonts/`

Les fichiers de police :

- `goodly-medium.otf`

### `assets/`

Les ressources graphiques :

- `kitoo-logo.jpg` — **le koala. Ne pas le recolorer** ni le modifier.

### `guidelines/`

La documentation de référence :

- Le **PDF** du design system Kitoo.

## Rappels

- Les noms de fichiers ci-dessus sont attendus tels quels par les étapes suivantes.
- Le logo ne doit jamais être recoloré.
- Une fois les fichiers déposés, l'intégration des tokens dans Tailwind / `globals.css`
  pourra commencer.
