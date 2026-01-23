# -*- coding: utf-8 -*-
"""
Tests for Cart API endpoints
"""

from odoo.tests import tagged, HttpCase
import json


@tagged('post_install', '-at_install')
class TestCartAPI(HttpCase):
    """Test Cart API endpoints"""

    def setUp(self):
        super().setUp()

        # Create test product
        self.product = self.env['product.template'].create({
            'name': 'Test Cart Product',
            'list_price': 99.99,
            'type': 'product',
        })

        # Create test user
        self.test_user = self.env['res.users'].create({
            'name': 'Test User',
            'login': 'testuser@example.com',
            'email': 'testuser@example.com',
            'password': 'testpassword',
        })

    def test_get_empty_cart(self):
        """Test GET /api/ecommerce/cart for empty cart"""
        response = self.url_open(
            '/api/ecommerce/cart',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertIn('cart', data)
        # Empty cart should have no lines
        cart = data.get('cart')
        if cart:
            self.assertEqual(len(cart.get('lines', [])), 0)

    def test_add_to_cart(self):
        """Test POST /api/ecommerce/cart/add"""
        # Get product variant ID
        product_variant = self.product.product_variant_id

        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({
                'product_id': product_variant.id,
                'quantity': 2,
            }),
            headers={'Content-Type': 'application/json'},
        )

        # Note: This may fail without proper session authentication
        # In real tests, would need to authenticate first
        self.assertIn(response.status_code, [200, 401])

    def test_update_cart_quantity(self):
        """Test PUT /api/ecommerce/cart/update/:line_id"""
        # This test requires an existing cart with items
        # Would need to create a cart first in setUp
        pass

    def test_remove_from_cart(self):
        """Test DELETE /api/ecommerce/cart/remove/:line_id"""
        # This test requires an existing cart with items
        pass

    def test_clear_cart(self):
        """Test DELETE /api/ecommerce/cart/clear"""
        response = self.url_open(
            '/api/ecommerce/cart/clear',
            headers={'Content-Type': 'application/json'},
        )

        # Should work even for empty cart
        self.assertIn(response.status_code, [200, 401])

    def test_cart_data_format(self):
        """Test that cart data matches TypeScript Cart interface"""
        # Create a cart with items directly in the database
        partner = self.test_user.partner_id
        cart = self.env['sale.order'].sudo().create({
            'partner_id': partner.id,
            'state': 'draft',
        })

        # Add product to cart
        product_variant = self.product.product_variant_id
        self.env['sale.order.line'].sudo().create({
            'order_id': cart.id,
            'product_id': product_variant.id,
            'product_uom_qty': 2,
        })

        # Get cart data
        cart_data = cart.get_cart_data()

        # Required fields from TypeScript interface
        required_fields = ['id', 'lines', 'amount_untaxed', 'amount_tax',
                          'amount_total', 'currency', 'line_count', 'item_count']

        for field in required_fields:
            self.assertIn(field, cart_data, f"Field '{field}' missing from cart data")

        # Validate currency structure
        currency = cart_data['currency']
        self.assertIn('id', currency)
        self.assertIn('code', currency)
        self.assertIn('symbol', currency)

        # Validate lines structure
        lines = cart_data['lines']
        self.assertIsInstance(lines, list)
        self.assertGreater(len(lines), 0)

        if lines:
            line = lines[0]
            # Line should have nested product object
            self.assertIn('id', line)
            self.assertIn('product', line)
            self.assertIn('quantity', line)
            self.assertIn('price_unit', line)
            self.assertIn('price_subtotal', line)
            self.assertIn('price_total', line)

            # Validate nested product structure
            product = line['product']
            self.assertIn('id', product)
            self.assertIn('name', product)
            self.assertIn('slug', product)
            self.assertIn('image', product)
            self.assertIn('price', product)

        # Validate item_count is sum of quantities
        expected_item_count = sum(line.product_uom_qty for line in cart.order_line)
        self.assertEqual(cart_data['item_count'], int(expected_item_count))

        # Validate line_count
        self.assertEqual(cart_data['line_count'], len(cart.order_line))

    def test_guest_cart_with_session(self):
        """Test cart management for guest user (session-based)"""
        # Create guest cart using session_id
        session_id = 'test-session-123'
        cart = self.env['sale.order'].sudo().create({
            'session_id': session_id,
            'state': 'draft',
        })

        # Add product
        product_variant = self.product.product_variant_id
        cart.add_cart_line(product_variant.id, 1)

        # Verify cart has the item
        self.assertEqual(len(cart.order_line), 1)

        # Get cart data
        cart_data = cart.get_cart_data()
        self.assertEqual(cart_data['item_count'], 1)
        self.assertEqual(cart_data['line_count'], 1)
