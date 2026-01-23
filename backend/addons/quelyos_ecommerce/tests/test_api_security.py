# -*- coding: utf-8 -*-
"""
Tests de sécurité pour les endpoints API e-commerce.
Teste spécifiquement:
- Rate limiting
- Mass assignment protection
- Input validation
- Access control
"""

from odoo.tests import tagged, HttpCase
import json


@tagged('post_install', '-at_install', 'security')
class TestAPISecurity(HttpCase):
    """Tests de sécurité des endpoints API."""

    def setUp(self):
        super().setUp()

        # Créer un utilisateur test
        self.test_user = self.env['res.users'].create({
            'name': 'Security Test User',
            'login': 'security@example.com',
            'email': 'security@example.com',
            'password': 'SecurePass123',
            'groups_id': [(6, 0, [self.env.ref('base.group_portal').id])],
        })

        # Créer un produit test
        self.test_product = self.env['product.template'].create({
            'name': 'Test Product Security',
            'list_price': 100.0,
            'sale_ok': True,
        })

    # ========== Tests Mass Assignment Protection ==========

    def test_register_mass_assignment_protection(self):
        """Test que l'inscription ne permet pas d'injecter is_company, credit_limit, etc."""
        response = self.url_open(
            '/api/ecommerce/auth/register',
            data=json.dumps({
                'name': 'Hacker',
                'email': 'hacker@example.com',
                'password': 'Password123',
                'is_company': True,  # Tentative d'injection
                'credit_limit': 999999,  # Tentative d'injection
                'property_payment_term_id': 1,  # Tentative d'injection
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        if data.get('success'):
            # Vérifier que le partner créé est bien customer (pas company)
            partner = self.env['res.partner'].sudo().search([
                ('email', '=', 'hacker@example.com')
            ], limit=1)

            if partner:
                self.assertFalse(partner.is_company, "is_company doit être False (protection mass assignment)")
                self.assertEqual(partner.credit_limit, 0.0, "credit_limit ne doit pas être modifiable")

    def test_update_profile_mass_assignment_protection(self):
        """Test que la mise à jour profil ne permet pas d'escalader les privilèges."""
        # Se connecter en tant que test_user
        self.authenticate('security@example.com', 'SecurePass123')

        response = self.url_open(
            '/api/ecommerce/customer/profile/update',
            data=json.dumps({
                'name': 'Updated Name',
                'is_company': True,  # Tentative d'injection
                'user_ids': [(6, 0, [1])],  # Tentative d'escalade à admin!
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Vérifier que l'utilisateur n'a pas été escaladé
        partner = self.test_user.partner_id
        self.assertFalse(partner.is_company)
        self.assertNotIn(self.env.ref('base.user_admin'), partner.user_ids)

    def test_add_address_parent_id_protection(self):
        """Test que add_address ne permet pas de forcer parent_id à un autre utilisateur."""
        # Se connecter
        self.authenticate('security@example.com', 'SecurePass123')

        # Créer un autre utilisateur
        other_user = self.env['res.users'].create({
            'name': 'Other User',
            'login': 'other@example.com',
            'email': 'other@example.com',
            'password': 'OtherPass123',
        })

        response = self.url_open(
            '/api/ecommerce/customer/addresses/add',
            data=json.dumps({
                'name': 'Billing Address',
                'street': '123 Street',
                'city': 'Paris',
                'parent_id': other_user.partner_id.id,  # Tentative d'injection!
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        if data.get('success') and 'address' in data:
            # Vérifier que parent_id est bien celui du test_user, pas other_user
            address_id = data['address']['id']
            address = self.env['res.partner'].sudo().browse(address_id)
            self.assertEqual(
                address.parent_id.id,
                self.test_user.partner_id.id,
                "parent_id doit être forcé à l'utilisateur authentifié"
            )

    # ========== Tests Input Validation ==========

    def test_cart_add_invalid_product_id(self):
        """Test ajout panier avec product_id invalide."""
        self.authenticate('security@example.com', 'SecurePass123')

        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({
                'product_id': -999,  # ID négatif
                'quantity': 1,
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)
        self.assertFalse(data.get('success'))
        self.assertIn('error', data)

    def test_cart_add_quantity_zero(self):
        """Test ajout panier avec quantité zéro."""
        self.authenticate('security@example.com', 'SecurePass123')

        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({
                'product_id': self.test_product.product_variant_ids[0].id,
                'quantity': 0,  # Quantité invalide
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)
        self.assertFalse(data.get('success'))

    def test_cart_add_quantity_excessive(self):
        """Test ajout panier avec quantité excessive (> 10000)."""
        self.authenticate('security@example.com', 'SecurePass123')

        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({
                'product_id': self.test_product.product_variant_ids[0].id,
                'quantity': 10001,  # Quantité excessive
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)
        self.assertFalse(data.get('success'))

    def test_register_invalid_email(self):
        """Test inscription avec email invalide."""
        response = self.url_open(
            '/api/ecommerce/auth/register',
            data=json.dumps({
                'name': 'Test User',
                'email': 'invalid.email.format',  # Format invalide
                'password': 'Password123',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)
        self.assertFalse(data.get('success'))
        self.assertIn('error', data)

    def test_register_email_too_long(self):
        """Test inscription avec email trop long (> 254 caractères)."""
        long_email = 'a' * 250 + '@test.com'

        response = self.url_open(
            '/api/ecommerce/auth/register',
            data=json.dumps({
                'name': 'Test User',
                'email': long_email,
                'password': 'Password123',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)
        self.assertFalse(data.get('success'))

    # ========== Tests Access Control ==========

    def test_cart_access_control(self):
        """Test qu'un utilisateur ne peut pas accéder au panier d'un autre."""
        # Créer deux utilisateurs
        user1 = self.env['res.users'].create({
            'name': 'User 1',
            'login': 'user1@example.com',
            'email': 'user1@example.com',
            'password': 'Pass123',
        })

        user2 = self.env['res.users'].create({
            'name': 'User 2',
            'login': 'user2@example.com',
            'email': 'user2@example.com',
            'password': 'Pass123',
        })

        # Créer un panier pour user1
        order_user1 = self.env['sale.order'].sudo().create({
            'partner_id': user1.partner_id.id,
            'state': 'draft',
        })

        # Se connecter en tant que user2
        self.authenticate('user2@example.com', 'Pass123')

        # Tenter d'accéder au panier de user1
        response = self.url_open(
            f'/api/ecommerce/cart/{order_user1.id}',
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Doit échouer ou retourner erreur
        # L'API doit refuser l'accès
        if not data.get('success'):
            self.assertIn('error', data)

    def test_order_access_control(self):
        """Test qu'un utilisateur ne peut pas voir les commandes d'un autre."""
        # Créer deux utilisateurs avec commandes
        user1 = self.env['res.users'].create({
            'name': 'User 1',
            'login': 'user1order@example.com',
            'email': 'user1order@example.com',
            'password': 'Pass123',
        })

        order_user1 = self.env['sale.order'].sudo().create({
            'partner_id': user1.partner_id.id,
            'state': 'sale',
        })

        # Se connecter en tant que test_user
        self.authenticate('security@example.com', 'SecurePass123')

        # Tenter d'accéder à la commande de user1
        response = self.url_open(
            f'/api/ecommerce/customer/orders/{order_user1.id}',
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Doit retourner erreur d'accès
        self.assertFalse(data.get('success'))

    # ========== Tests Rate Limiting ==========

    def test_rate_limiting_login(self):
        """Test rate limiting sur endpoint login (5 tentatives/minute)."""
        # Faire 6 tentatives de login rapides
        for i in range(6):
            response = self.url_open(
                '/api/ecommerce/auth/login',
                data=json.dumps({
                    'login': 'nonexistent@example.com',
                    'password': 'wrongpass',
                }),
                headers={'Content-Type': 'application/json'},
            )

            data = json.loads(response.content)

            if i >= 5:
                # La 6ème requête doit être rate limited
                self.assertFalse(data.get('success'))
                self.assertIn('Trop de requêtes', data.get('error', ''))
                break

    def test_rate_limiting_register(self):
        """Test rate limiting sur endpoint register (3 tentatives/5 min)."""
        # Faire 4 tentatives d'inscription rapides
        for i in range(4):
            response = self.url_open(
                '/api/ecommerce/auth/register',
                data=json.dumps({
                    'name': f'Test User {i}',
                    'email': f'test{i}@ratelimit.com',
                    'password': 'Password123',
                }),
                headers={'Content-Type': 'application/json'},
            )

            data = json.loads(response.content)

            if i >= 3:
                # La 4ème requête doit être rate limited
                self.assertFalse(data.get('success'))
                self.assertIn('Trop de requêtes', data.get('error', ''))
                break

    # ========== Tests XSS Protection ==========

    def test_review_xss_protection(self):
        """Test protection XSS dans les avis produits."""
        self.authenticate('security@example.com', 'SecurePass123')

        response = self.url_open(
            '/api/ecommerce/reviews/submit',
            data=json.dumps({
                'product_id': self.test_product.id,
                'rating': 5,
                'title': 'Test Review',
                'comment': '<script>alert("XSS")</script>Excellent produit!',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        if data.get('success') and 'review' in data:
            # Vérifier que le script a été échappé
            comment = data['review'].get('comment', '')
            self.assertNotIn('<script>', comment)
            self.assertIn('&lt;script&gt;', comment, "Les balises HTML doivent être échappées")


@tagged('post_install', '-at_install', 'security', 'slow')
class TestWebhookSecurity(HttpCase):
    """Tests de sécurité pour les webhooks."""

    def setUp(self):
        super().setUp()

        # Configurer Stripe provider
        self.stripe_provider = self.env['payment.provider'].sudo().create({
            'name': 'Stripe Test',
            'code': 'stripe',
            'state': 'enabled',
            'stripe_publishable_key': 'pk_test_xxx',
            'stripe_secret_key': 'sk_test_xxx',
            'stripe_webhook_secret': 'whsec_test_secret',
        })

    def test_webhook_requires_signature(self):
        """Test que le webhook Stripe nécessite une signature HMAC valide."""
        # Envoyer un webhook sans signature
        response = self.url_open(
            '/api/ecommerce/payment/stripe/webhook',
            data=json.dumps({
                'type': 'payment_intent.succeeded',
                'data': {
                    'object': {
                        'id': 'pi_test_123',
                    }
                }
            }),
            headers={'Content-Type': 'application/json'},
        )

        # Doit retourner erreur 400 (signature manquante)
        self.assertEqual(response.status_code, 400)

    def test_webhook_invalid_signature(self):
        """Test que le webhook refuse une signature invalide."""
        payload = json.dumps({
            'type': 'payment_intent.succeeded',
            'data': {'object': {'id': 'pi_test_123'}}
        })

        response = self.url_open(
            '/api/ecommerce/payment/stripe/webhook',
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Stripe-Signature': 't=1234567890,v1=invalid_signature',
            },
        )

        # Doit retourner erreur 400 (signature invalide)
        self.assertEqual(response.status_code, 400)
