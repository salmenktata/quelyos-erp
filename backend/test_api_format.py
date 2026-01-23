#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de test pour valider le format des APIs E-commerce
Vérifie que les réponses correspondent aux interfaces TypeScript du frontend
"""

import requests
import json
import sys

# Configuration
ODOO_URL = "http://localhost:8069"
DATABASE = "quelyos"
USERNAME = "admin"
PASSWORD = "admin"


def authenticate():
    """Authentification à Odoo"""
    url = f"{ODOO_URL}/web/session/authenticate"
    payload = {
        "jsonrpc": "2.0",
        "params": {
            "db": DATABASE,
            "login": USERNAME,
            "password": PASSWORD
        }
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()

        if result.get("result") and result["result"].get("uid"):
            print("✓ Authentification réussie")
            return response.cookies
        else:
            print("✗ Échec authentification:", result.get("error", {}).get("message"))
            return None
    except Exception as e:
        print(f"✗ Erreur authentification: {e}")
        return None


def test_products_api(cookies):
    """Test API GET /api/ecommerce/products"""
    print("\n=== Test API Produits ===")

    url = f"{ODOO_URL}/api/ecommerce/products"
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {
            "limit": 5,
            "offset": 0
        },
        "id": 1
    }

    try:
        response = requests.post(url, json=payload, cookies=cookies)
        response.raise_for_status()
        result = response.json()

        if not result.get("result"):
            print(f"✗ Pas de résultat: {result}")
            return False

        data = result["result"]

        # Vérifier structure de base
        required_fields = ["success", "products", "total", "facets"]
        for field in required_fields:
            if field not in data:
                print(f"✗ Champ manquant dans response: {field}")
                return False

        print(f"✓ Structure response OK: {len(data['products'])} produits, total={data['total']}")

        # Vérifier format produit
        if data["products"]:
            product = data["products"][0]
            product_required = ["id", "name", "slug", "description", "list_price",
                               "currency", "is_featured", "images", "category",
                               "in_stock", "seo"]

            missing = [f for f in product_required if f not in product]
            if missing:
                print(f"✗ Champs manquants dans Product: {missing}")
                return False

            # Vérifier currency structure
            currency = product["currency"]
            if not all(k in currency for k in ["id", "code", "symbol"]):
                print(f"✗ Structure currency invalide: {currency}")
                return False

            print(f"✓ Format Product OK: {product['name']}")
            print(f"  - Currency: {currency['code']} ({currency['symbol']})")
            print(f"  - Images: {len(product['images'])} image(s)")
            print(f"  - Slug: {product['slug']}")

            # Vérifier images structure
            if product["images"]:
                img = product["images"][0]
                if not all(k in img for k in ["id", "url", "alt", "is_main"]):
                    print(f"✗ Structure image invalide: {img}")
                    return False
                print(f"✓ Format Image OK: is_main={img['is_main']}")

        # Vérifier facets
        facets = data["facets"]
        facets_required = ["categories", "price_range"]
        missing_facets = [f for f in facets_required if f not in facets]
        if missing_facets:
            print(f"✗ Facets manquants: {missing_facets}")
            return False

        print(f"✓ Facets OK:")
        print(f"  - Categories: {len(facets['categories'])} catégorie(s)")
        print(f"  - Price range: {facets['price_range']['min']} - {facets['price_range']['max']}")

        return True

    except Exception as e:
        print(f"✗ Erreur test products API: {e}")
        return False


def test_cart_api(cookies):
    """Test API GET /api/ecommerce/cart"""
    print("\n=== Test API Panier ===")

    url = f"{ODOO_URL}/api/ecommerce/cart"
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {},
        "id": 2
    }

    try:
        response = requests.post(url, json=payload, cookies=cookies)
        response.raise_for_status()
        result = response.json()

        if not result.get("result"):
            print(f"✗ Pas de résultat: {result}")
            return False

        data = result["result"]

        # Vérifier structure de base
        if not data.get("success"):
            print(f"✗ API retourne success=False: {data.get('error')}")
            return False

        cart = data.get("cart")
        if not cart:
            print("✓ Panier vide (normal si aucun produit ajouté)")
            return True

        # Vérifier format cart
        cart_required = ["id", "lines", "amount_untaxed", "amount_tax",
                        "amount_total", "currency", "line_count", "item_count"]

        missing = [f for f in cart_required if f not in cart]
        if missing:
            print(f"✗ Champs manquants dans Cart: {missing}")
            return False

        print(f"✓ Format Cart OK:")
        print(f"  - ID: {cart['id']}")
        print(f"  - Lines: {cart['line_count']}")
        print(f"  - Items: {cart['item_count']}")
        print(f"  - Total: {cart['amount_total']} {cart['currency']['code']}")

        # Vérifier format lines
        if cart["lines"]:
            line = cart["lines"][0]
            line_required = ["id", "product", "quantity", "price_unit",
                           "price_subtotal", "price_total"]

            missing_line = [f for f in line_required if f not in line]
            if missing_line:
                print(f"✗ Champs manquants dans CartLine: {missing_line}")
                return False

            # Vérifier nested product
            product = line["product"]
            product_required = ["id", "name", "slug", "image", "price"]
            missing_product = [f for f in product_required if f not in product]
            if missing_product:
                print(f"✗ Champs manquants dans nested Product: {missing_product}")
                return False

            print(f"✓ Format CartLine OK:")
            print(f"  - Product: {product['name']}")
            print(f"  - Quantity: {line['quantity']}")
            print(f"  - Subtotal: {line['price_subtotal']}")

        return True

    except Exception as e:
        print(f"✗ Erreur test cart API: {e}")
        return False


def main():
    """Fonction principale"""
    print("=" * 60)
    print("Test de validation format APIs E-commerce Quelyos")
    print("=" * 60)

    # Authentification
    cookies = authenticate()
    if not cookies:
        print("\n✗ Impossible de continuer sans authentification")
        sys.exit(1)

    # Tests
    results = []
    results.append(("Products API", test_products_api(cookies)))
    results.append(("Cart API", test_cart_api(cookies)))

    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DES TESTS")
    print("=" * 60)

    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {name}")

    all_passed = all(r[1] for r in results)

    if all_passed:
        print("\n🎉 Tous les tests sont passés !")
        print("Les APIs retournent le bon format pour le frontend TypeScript.")
        sys.exit(0)
    else:
        print("\n⚠️  Certains tests ont échoué.")
        print("Vérifiez les erreurs ci-dessus.")
        sys.exit(1)


if __name__ == "__main__":
    main()
