# Anti-patterns et erreurs à éviter

## TypeScript / React
- `any` ou `as any`
- Composants > 300 lignes
- Prop drilling > 2 niveaux
- `useEffect` sans dépendances
- Muter le state directement
- Oublier `key` ou utiliser `index` comme key
- `import _ from 'lodash'` (importer fonction par fonction)
- `dangerouslySetInnerHTML` sans sanitization

## Next.js
- `'use client'` par défaut
- Appels API sans gestion erreur
- `<img>` au lieu de `<Image>`
- Secrets exposés côté client

## Backend Odoo
- Modifier DB sans ORM
- `sudo()` non documenté
- Endpoints sans validation
- Erreurs Python brutes (formater en JSON)
- `cr.execute` SQL direct
- Modifier modèles sans héritage
- Oublier `security/ir.model.access.csv`
- Boucles N+1 queries
- `search()` sans limite
- **Odoo 19** : Vues `<tree>` imbriquées dans widgets `many2many_tags` (erreur "Cannot find key 'tree' in views registry")
- **Odoo 19** : Utiliser `category_id` au lieu de privilèges pour groupes de sécurité

## API
- Oublier pagination
- Retourner mots de passe/tokens
- Endpoints sans auth (sauf public)
- Modifier API sans versioning

## Git
- Committer sur `main` directement
- Committer `.env`, secrets, `node_modules/`
- Commits vagues ("fix", "update")
- Push `--force` sur main

## Sécurité
- Mots de passe en clair
- Confiance données client
- Oublier CORS
- Stack traces en production
- `eval()` avec données utilisateur
