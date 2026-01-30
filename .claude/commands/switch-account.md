# Commande /switch-account - Basculer entre Comptes Claude

Permet de basculer rapidement entre 2 comptes Claude Max Pro sauvegardés.

## Usage

```bash
/switch-account          # Afficher l'état des comptes
/switch-account 1        # Basculer vers le compte 1
/switch-account 2        # Basculer vers le compte 2
/switch-account save 1   # Sauvegarder le compte actuel comme compte 1
/switch-account save 2   # Sauvegarder le compte actuel comme compte 2
```

## Quand utiliser ?

- **Changer de compte Claude** : Basculer entre vos 2 emails Claude Pro
- **Sauvegarder un compte** : Enregistrer les credentials du compte actuel
- **Vérifier configuration** : Voir quels comptes sont configurés

## Instructions pour Claude

Quand l'utilisateur exécute `/switch-account [args]`, effectue :

### 1. Vérifier le Script

1. **Confirmer existence** : Le script `scripts/switch-claude-account.sh` doit exister
2. **Vérifier permissions** : Doit être exécutable (`chmod +x`)

### 2. Exécuter l'Action

#### Sans arguments → Afficher l'état
```bash
./scripts/switch-claude-account.sh status
```

#### Avec numéro (1 ou 2) → Basculer vers ce compte
```bash
./scripts/switch-claude-account.sh 1  # ou 2
```

**Important** :
- Informer l'utilisateur que Claude va se relancer
- Le script demande confirmation avant de relancer
- La session actuelle sera fermée

#### Avec "save" → Sauvegarder le compte actuel
```bash
./scripts/switch-claude-account.sh save 1  # ou save 2
```

### 3. Messages Utilisateur

#### Si switch réussi
```
✅ Basculement vers le compte [X] effectué
🔄 Claude va se relancer avec le nouveau compte
```

#### Si compte non configuré
```
❌ Le compte [X] n'est pas encore configuré

Pour le configurer :
1. Connectez-vous à Claude avec le compte souhaité
2. Lancez: /switch-account save [X]
```

#### Si sauvegarde réussie
```
✅ Compte [X] sauvegardé avec succès
Vous pouvez maintenant utiliser: /switch-account [X]
```

### 4. Gestion d'Erreurs

- **Script inexistant** : Proposer de le recréer
- **Permissions manquantes** : Exécuter `chmod +x scripts/switch-claude-account.sh`
- **Arguments invalides** : Afficher l'aide

## Exemples

```bash
# Vérifier quels comptes sont configurés
/switch-account

# Basculer vers le compte 2
/switch-account 2

# Sauvegarder le compte actuel comme compte 1
/switch-account save 1
```

## Notes Techniques

- **Script backend** : `scripts/switch-claude-account.sh`
- **Stockage credentials** : `~/.claude-accounts/account-1/` et `account-2/`
- **Éléments sauvegardés** :
  - Dossier `~/.claude`
  - Fichier `~/.claude.json`
  - Credentials Keychain macOS
- **Reconnexion forcée** : Le script propose de relancer `claude` automatiquement
