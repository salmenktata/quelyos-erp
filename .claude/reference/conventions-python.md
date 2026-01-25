# Conventions Python (Backend Odoo)

## Structure module Odoo
```
quelyos_api/
├── __manifest__.py
├── __init__.py
├── controllers/      → Endpoints API REST
├── models/           → Modèles Odoo (si extension)
├── security/         → Droits d'accès
└── views/            → Vues XML (si backend Odoo)
```

## Règles API REST
- Préfixe : `/api/ecommerce/`
- Réponses JSON : `{ data: ..., error: ..., message: ... }`
- Codes HTTP : 200, 201, 400, 401, 404, 500
- CORS activé, validation serveur

## Style Python
- PEP 8 strict
- Docstrings pour méthodes publiques
- Type hints pour fonctions
- `sudo()` avec précaution, documenter pourquoi

## Compatibilité Odoo 19
- `detailed_type` → `type` (sur product.template)
- Utiliser `getattr(model, 'field', default)` pour champs optionnels
- Vérifier champs via `\d <table_name>` avant utilisation
