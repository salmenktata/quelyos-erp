# -*- coding: utf-8 -*-
"""
Configuration CSRF pour activation progressive.

Ce module permet d'activer le CSRF endpoint par endpoint pour une migration en douceur.

Usage:
    1. Phase 1: Endpoints non-critiques (produits, wishlist) - Semaine 1
    2. Phase 2: Cart et customer - Semaine 2
    3. Phase 3: Auth et checkout - Semaine 3
    4. Phase 4: Paiements - Semaine 4

Pour activer un endpoint, passer sa valeur de False à True.
"""

# Phase 1: Endpoints publics non-critiques (READY TO ACTIVATE)
PHASE_1_ENDPOINTS = {
    # Products
    '/api/ecommerce/products': False,  # GET: Pas de risque CSRF, mais keep consistency
    '/api/ecommerce/products/<int:product_id>': False,
    '/api/ecommerce/products/featured': False,
    '/api/ecommerce/products/search': False,
    '/api/ecommerce/products/<int:product_id>/variants': False,
    '/api/ecommerce/categories': False,
}

# Phase 2: Wishlist et Comparison (MEDIUM RISK)
PHASE_2_ENDPOINTS = {
    # Wishlist
    '/api/ecommerce/wishlist': False,
    '/api/ecommerce/wishlist/add': False,
    '/api/ecommerce/wishlist/remove/<int:product_id>': False,
    '/api/ecommerce/wishlist/check/<int:product_id>': False,

    # Comparison
    '/api/ecommerce/comparison': False,
    '/api/ecommerce/comparison/add': False,
    '/api/ecommerce/comparison/remove/<int:product_id>': False,
    '/api/ecommerce/comparison/clear': False,
}

# Phase 3: Cart et Customer (HIGH RISK)
PHASE_3_ENDPOINTS = {
    # Cart
    '/api/ecommerce/cart': False,
    '/api/ecommerce/cart/add': False,
    '/api/ecommerce/cart/update/<int:line_id>': False,
    '/api/ecommerce/cart/remove/<int:line_id>': False,
    '/api/ecommerce/cart/clear': False,
    '/api/ecommerce/cart/<int:order_id>': False,

    # Customer
    '/api/ecommerce/customer/profile': False,
    '/api/ecommerce/customer/profile/update': False,
    '/api/ecommerce/customer/orders': False,
    '/api/ecommerce/customer/orders/<int:order_id>': False,
    '/api/ecommerce/customer/addresses': False,
    '/api/ecommerce/customer/addresses/add': False,
    '/api/ecommerce/customer/addresses/<int:address_id>': False,
    '/api/ecommerce/customer/addresses/<int:address_id>/delete': False,
}

# Phase 4: Auth et Checkout (CRITICAL)
PHASE_4_ENDPOINTS = {
    # Auth
    '/api/ecommerce/auth/session': False,  # GET: Pas de risque mais keep consistency
    '/api/ecommerce/auth/login': False,
    '/api/ecommerce/auth/logout': False,
    '/api/ecommerce/auth/register': False,
    '/api/ecommerce/auth/reset-password': False,

    # Checkout
    '/api/ecommerce/checkout/validate': False,
    '/api/ecommerce/checkout/delivery-methods': False,
    '/api/ecommerce/checkout/set-delivery': False,
    '/api/ecommerce/checkout/payment-methods': False,
    '/api/ecommerce/checkout/confirm': False,
}

# Phase 5: Paiements et Reviews (CRITICAL)
PHASE_5_ENDPOINTS = {
    # Payment
    '/api/ecommerce/payment/stripe/intent': False,
    '/api/ecommerce/payment/stripe/confirm': False,
    # Note: /api/ecommerce/payment/stripe/webhook doit TOUJOURS rester csrf=False
    # Car Stripe ne peut pas fournir de token CSRF (authentification par signature HMAC)

    # Reviews
    '/api/ecommerce/reviews/submit': False,
    '/api/ecommerce/products/<int:product_id>/reviews': False,
    '/api/ecommerce/reviews/<int:review_id>/helpful': False,
    '/api/ecommerce/customer/reviews': False,

    # Coupons
    '/api/ecommerce/coupon/validate': False,
    '/api/ecommerce/coupon/remove': False,
    '/api/ecommerce/coupons/available': False,

    # Webhooks (TOUJOURS csrf=False pour webhooks externes)
    '/api/ecommerce/webhooks/test': False,
    '/api/ecommerce/webhooks/stock-change': False,
}

# Merge all phases
CSRF_ENABLED_ENDPOINTS = {
    **PHASE_1_ENDPOINTS,
    **PHASE_2_ENDPOINTS,
    **PHASE_3_ENDPOINTS,
    **PHASE_4_ENDPOINTS,
    **PHASE_5_ENDPOINTS,
}


def is_csrf_enabled(route):
    """
    Vérifie si CSRF est activé pour une route donnée.

    Args:
        route (str): La route HTTP (ex: '/api/ecommerce/products')

    Returns:
        bool: True si CSRF activé, False sinon
    """
    return CSRF_ENABLED_ENDPOINTS.get(route, False)


def get_csrf_status_report():
    """
    Génère un rapport du statut CSRF par phase.

    Returns:
        dict: Rapport avec statistiques par phase
    """
    phases = {
        'Phase 1 - Publics (Low Risk)': PHASE_1_ENDPOINTS,
        'Phase 2 - Wishlist (Medium Risk)': PHASE_2_ENDPOINTS,
        'Phase 3 - Cart/Customer (High Risk)': PHASE_3_ENDPOINTS,
        'Phase 4 - Auth/Checkout (Critical)': PHASE_4_ENDPOINTS,
        'Phase 5 - Payments/Reviews (Critical)': PHASE_5_ENDPOINTS,
    }

    report = {}
    total_enabled = 0
    total_endpoints = 0

    for phase_name, endpoints in phases.items():
        enabled_count = sum(1 for enabled in endpoints.values() if enabled)
        total_count = len(endpoints)
        percentage = (enabled_count / total_count * 100) if total_count > 0 else 0

        report[phase_name] = {
            'enabled': enabled_count,
            'total': total_count,
            'percentage': f'{percentage:.1f}%',
            'status': 'Complete' if enabled_count == total_count else
                     'In Progress' if enabled_count > 0 else 'Not Started',
        }

        total_enabled += enabled_count
        total_endpoints += total_count

    report['TOTAL'] = {
        'enabled': total_enabled,
        'total': total_endpoints,
        'percentage': f'{(total_enabled / total_endpoints * 100):.1f}%',
    }

    return report


def activate_phase(phase_number):
    """
    Active tous les endpoints d'une phase.

    NOTE: Cette fonction est documentaire. Pour activer réellement,
    modifier manuellement les valeurs dans PHASE_X_ENDPOINTS ci-dessus.

    Args:
        phase_number (int): Numéro de phase (1-5)

    Returns:
        list: Liste des routes qui seraient activées
    """
    phases = {
        1: PHASE_1_ENDPOINTS,
        2: PHASE_2_ENDPOINTS,
        3: PHASE_3_ENDPOINTS,
        4: PHASE_4_ENDPOINTS,
        5: PHASE_5_ENDPOINTS,
    }

    if phase_number not in phases:
        raise ValueError(f"Phase {phase_number} invalide. Doit être entre 1 et 5.")

    phase_endpoints = phases[phase_number]
    routes_to_activate = [route for route, enabled in phase_endpoints.items() if not enabled]

    return routes_to_activate


# Endpoints qui doivent TOUJOURS rester csrf=False
CSRF_EXEMPTIONS = [
    '/api/ecommerce/payment/stripe/webhook',  # Webhook externe Stripe (HMAC auth)
    # Ajouter d'autres webhooks externes ici si nécessaire
]


def should_exempt_csrf(route):
    """
    Vérifie si une route doit être exemptée de CSRF.

    Args:
        route (str): La route HTTP

    Returns:
        bool: True si doit être exemptée, False sinon
    """
    return route in CSRF_EXEMPTIONS


if __name__ == '__main__':
    # Script pour afficher le rapport de statut CSRF
    print("\n" + "="*60)
    print(" CSRF ACTIVATION STATUS REPORT")
    print("="*60 + "\n")

    report = get_csrf_status_report()

    for phase_name, stats in report.items():
        if phase_name == 'TOTAL':
            print("\n" + "-"*60)
            print(f"TOTAL: {stats['enabled']}/{stats['total']} ({stats['percentage']})")
            print("-"*60)
        else:
            status_icon = "✅" if stats['status'] == 'Complete' else \
                         "🔄" if stats['status'] == 'In Progress' else "⏸️"
            print(f"{status_icon} {phase_name}")
            print(f"   Enabled: {stats['enabled']}/{stats['total']} ({stats['percentage']})")
            print(f"   Status: {stats['status']}\n")

    print("\nNext Steps:")
    print("1. Activate Phase 1 endpoints (Low Risk)")
    print("2. Test frontend integration")
    print("3. Monitor for 48 hours")
    print("4. Proceed to Phase 2")
    print("\nSee CSRF_ACTIVATION_GUIDE.md for detailed instructions.\n")
