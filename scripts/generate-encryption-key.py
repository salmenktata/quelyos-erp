#!/usr/bin/env python3
"""
Script de génération de clé de chiffrement Fernet pour API keys IA.
Utilise cryptography.fernet pour générer une clé sécurisée AES-128-CBC + HMAC-SHA256.
"""
from cryptography.fernet import Fernet

def main():
    # Générer une clé Fernet (32 bytes base64-encoded)
    key = Fernet.generate_key()

    print("=" * 60)
    print("🔐 CLÉ DE CHIFFREMENT FERNET GÉNÉRÉE")
    print("=" * 60)
    print("\nAjouter cette ligne à odoo-backend/.env :\n")
    print(f"QUELYOS_ENCRYPTION_KEY={key.decode()}")
    print("\n" + "=" * 60)
    print("⚠️  IMPORTANT : Sauvegarder cette clé de manière sécurisée !")
    print("Sans cette clé, les API keys chiffrées ne pourront pas être déchiffrées.")
    print("=" * 60)

if __name__ == '__main__':
    main()
