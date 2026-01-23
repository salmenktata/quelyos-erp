# -*- coding: utf-8 -*-

from odoo.tests import TransactionCase
from odoo.exceptions import ValidationError


class TestInputValidator(TransactionCase):
    """Tests unitaires pour le InputValidator."""

    def setUp(self):
        super().setUp()
        self.validator = self.env['input.validator']

    # ========== Tests validate_email ==========

    def test_validate_email_valid(self):
        """Test validation email valide."""
        result = self.validator.validate_email('test@example.com')
        self.assertEqual(result, 'test@example.com')

    def test_validate_email_normalization(self):
        """Test normalisation email (lowercase, strip)."""
        result = self.validator.validate_email('  TEST@EXAMPLE.COM  ')
        self.assertEqual(result, 'test@example.com')

    def test_validate_email_invalid_format(self):
        """Test email format invalide."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_email('invalid.email')
        self.assertIn('Format email invalide', str(cm.exception))

    def test_validate_email_missing_domain(self):
        """Test email sans domaine."""
        with self.assertRaises(ValidationError):
            self.validator.validate_email('user@')

    def test_validate_email_too_long(self):
        """Test email trop long (> 254 caractères)."""
        long_email = 'a' * 250 + '@test.com'
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_email(long_email)
        self.assertIn('trop long', str(cm.exception))

    def test_validate_email_empty(self):
        """Test email vide."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_email('')
        self.assertIn('Email requis', str(cm.exception))

    # ========== Tests validate_phone ==========

    def test_validate_phone_valid(self):
        """Test validation téléphone valide."""
        result = self.validator.validate_phone('+33123456789')
        self.assertEqual(result, '+33123456789')

    def test_validate_phone_normalization(self):
        """Test normalisation téléphone (remove spaces, dashes)."""
        result = self.validator.validate_phone('+33 1 23 45 67 89')
        self.assertEqual(result, '+33123456789')

    def test_validate_phone_too_short(self):
        """Test téléphone trop court."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_phone('123')
        self.assertIn('trop court', str(cm.exception))

    def test_validate_phone_empty(self):
        """Test téléphone vide (autorisé)."""
        result = self.validator.validate_phone('')
        self.assertEqual(result, '')

    # ========== Tests validate_id ==========

    def test_validate_id_valid(self):
        """Test validation ID valide."""
        result = self.validator.validate_id(123, 'product_id')
        self.assertEqual(result, 123)

    def test_validate_id_string_convertible(self):
        """Test ID sous forme de string."""
        result = self.validator.validate_id('456', 'order_id')
        self.assertEqual(result, 456)

    def test_validate_id_negative(self):
        """Test ID négatif."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_id(-1, 'product_id')
        self.assertIn('doit être positif', str(cm.exception))

    def test_validate_id_zero(self):
        """Test ID zéro."""
        with self.assertRaises(ValidationError):
            self.validator.validate_id(0, 'product_id')

    def test_validate_id_invalid_type(self):
        """Test ID type invalide."""
        with self.assertRaises(ValidationError):
            self.validator.validate_id('abc', 'product_id')

    # ========== Tests validate_quantity ==========

    def test_validate_quantity_valid(self):
        """Test validation quantité valide."""
        result = self.validator.validate_quantity(5)
        self.assertEqual(result, 5)

    def test_validate_quantity_zero(self):
        """Test quantité zéro."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_quantity(0)
        self.assertIn('supérieure à zéro', str(cm.exception))

    def test_validate_quantity_too_high(self):
        """Test quantité trop élevée (> 10000)."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_quantity(10001)
        self.assertIn('trop élevée', str(cm.exception))

    def test_validate_quantity_negative(self):
        """Test quantité négative."""
        with self.assertRaises(ValidationError):
            self.validator.validate_quantity(-5)

    # ========== Tests validate_price ==========

    def test_validate_price_valid(self):
        """Test validation prix valide."""
        result = self.validator.validate_price(99.99)
        self.assertEqual(result, 99.99)

    def test_validate_price_rounding(self):
        """Test arrondi prix (2 décimales)."""
        result = self.validator.validate_price(99.999)
        self.assertEqual(result, 100.0)

    def test_validate_price_negative(self):
        """Test prix négatif."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_price(-10)
        self.assertIn('positif', str(cm.exception))

    def test_validate_price_string(self):
        """Test prix sous forme de string."""
        result = self.validator.validate_price('49.99')
        self.assertEqual(result, 49.99)

    # ========== Tests validate_string ==========

    def test_validate_string_valid(self):
        """Test validation string valide."""
        result = self.validator.validate_string('Hello', field_name='name')
        self.assertEqual(result, 'Hello')

    def test_validate_string_strip(self):
        """Test strip whitespace."""
        result = self.validator.validate_string('  Hello  ', field_name='name')
        self.assertEqual(result, 'Hello')

    def test_validate_string_too_short(self):
        """Test string trop courte."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_string('Hi', field_name='name', min_length=3)
        self.assertIn('minimum 3', str(cm.exception))

    def test_validate_string_too_long(self):
        """Test string trop longue."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_string('a' * 101, field_name='name', max_length=100)
        self.assertIn('maximum 100', str(cm.exception))

    def test_validate_string_required_missing(self):
        """Test string requise manquante."""
        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_string('', field_name='name', required=True)
        self.assertIn('requis', str(cm.exception))

    # ========== Tests sanitize_html ==========

    def test_sanitize_html_escape(self):
        """Test échappement HTML."""
        result = self.validator.sanitize_html('<script>alert("xss")</script>')
        self.assertNotIn('<script>', result)
        self.assertIn('&lt;script&gt;', result)

    def test_sanitize_html_empty(self):
        """Test sanitize vide."""
        result = self.validator.sanitize_html('')
        self.assertEqual(result, '')

    def test_sanitize_html_ampersand(self):
        """Test échappement & < >."""
        result = self.validator.sanitize_html('A & B < C > D')
        self.assertIn('&amp;', result)
        self.assertIn('&lt;', result)
        self.assertIn('&gt;', result)


class TestPartnerValidator(TransactionCase):
    """Tests unitaires pour le PartnerValidator."""

    def setUp(self):
        super().setUp()
        self.validator = self.env['partner.validator']

    # ========== Tests validate_registration_data ==========

    def test_validate_registration_valid(self):
        """Test validation inscription valide."""
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '+33123456789',
            'street': '123 Main St',
            'city': 'Paris',
            'zip': '75001',
        }
        result = self.validator.validate_registration_data(data)

        self.assertEqual(result['name'], 'John Doe')
        self.assertEqual(result['email'], 'john@example.com')
        self.assertEqual(result['customer_rank'], 1)
        self.assertEqual(result['is_company'], False)
        self.assertTrue(result['active'])

    def test_validate_registration_whitelist(self):
        """Test filtrage whitelist (champs non autorisés supprimés)."""
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'is_company': True,  # NON AUTORISÉ
            'credit_limit': 99999,  # NON AUTORISÉ
            'property_payment_term_id': 1,  # NON AUTORISÉ
        }
        result = self.validator.validate_registration_data(data)

        # Vérifier que les champs dangereux ont été supprimés
        self.assertNotIn('credit_limit', result)
        self.assertNotIn('property_payment_term_id', result)

        # Vérifier que is_company est forcé à False
        self.assertEqual(result['is_company'], False)

    def test_validate_registration_email_uniqueness(self):
        """Test unicité email."""
        # Créer un partner existant
        self.env['res.partner'].create({
            'name': 'Existing User',
            'email': 'existing@example.com',
        })

        # Tenter de créer avec même email
        data = {
            'name': 'New User',
            'email': 'existing@example.com',
        }

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_registration_data(data)
        self.assertIn('déjà utilisé', str(cm.exception))

    def test_validate_registration_email_invalid(self):
        """Test email invalide."""
        data = {
            'name': 'John Doe',
            'email': 'invalid-email',
        }

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_registration_data(data)
        self.assertIn('Format email invalide', str(cm.exception))

    def test_validate_registration_missing_required(self):
        """Test champs requis manquants."""
        data = {
            'name': 'John Doe',
            # email manquant
        }

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_registration_data(data)
        self.assertIn('requis', str(cm.exception))

    # ========== Tests validate_address_data ==========

    def test_validate_address_valid(self):
        """Test validation adresse valide."""
        data = {
            'name': 'John Doe',
            'street': '123 Main St',
            'city': 'Paris',
            'zip': '75001',
            'country_id': 1,
        }
        result = self.validator.validate_address_data(data)

        self.assertEqual(result['street'], '123 Main St')
        self.assertEqual(result['city'], 'Paris')

    def test_validate_address_whitelist(self):
        """Test filtrage whitelist pour adresses."""
        data = {
            'name': 'John Doe',
            'street': '123 Main St',
            'is_company': True,  # NON AUTORISÉ
            'user_ids': [(6, 0, [1])],  # NON AUTORISÉ - DANGER!
        }
        result = self.validator.validate_address_data(data)

        # Vérifier que les champs dangereux ont été supprimés
        self.assertNotIn('is_company', result)
        self.assertNotIn('user_ids', result)

    def test_validate_address_phone_normalization(self):
        """Test normalisation téléphone dans adresse."""
        data = {
            'name': 'John Doe',
            'phone': '+33 1 23 45 67 89',
        }
        result = self.validator.validate_address_data(data)

        self.assertEqual(result['phone'], '+33123456789')

    # ========== Tests validate_update_data ==========

    def test_validate_update_valid(self):
        """Test validation mise à jour valide."""
        # Créer un partner
        partner = self.env['res.partner'].create({
            'name': 'John Doe',
            'email': 'john@example.com',
        })

        data = {
            'name': 'John Updated',
            'phone': '+33987654321',
        }
        result = self.validator.validate_update_data(data, partner.id)

        self.assertEqual(result['name'], 'John Updated')

    def test_validate_update_email_uniqueness(self):
        """Test unicité email lors de mise à jour."""
        # Créer deux partners
        partner1 = self.env['res.partner'].create({
            'name': 'User 1',
            'email': 'user1@example.com',
        })
        partner2 = self.env['res.partner'].create({
            'name': 'User 2',
            'email': 'user2@example.com',
        })

        # Tenter de mettre à jour partner1 avec email de partner2
        data = {
            'email': 'user2@example.com',
        }

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_update_data(data, partner1.id)
        self.assertIn('déjà utilisé', str(cm.exception))

    def test_validate_update_same_email(self):
        """Test mise à jour avec même email (autorisé)."""
        partner = self.env['res.partner'].create({
            'name': 'John Doe',
            'email': 'john@example.com',
        })

        data = {
            'name': 'John Updated',
            'email': 'john@example.com',  # Même email
        }

        # Ne doit pas lever d'erreur
        result = self.validator.validate_update_data(data, partner.id)
        self.assertEqual(result['email'], 'john@example.com')
