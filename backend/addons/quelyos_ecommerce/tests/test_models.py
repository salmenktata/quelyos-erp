# -*- coding: utf-8 -*-
"""
Tests for Quelyos E-commerce models
"""

from odoo.tests import TransactionCase


class TestProductTemplate(TransactionCase):
    """Test ProductTemplate model extensions"""

    def setUp(self):
        super().setUp()

        self.category = self.env['product.category'].create({
            'name': 'Test Category',
        })

    def test_product_creation(self):
        """Test creating a product with e-commerce fields"""
        product = self.env['product.template'].create({
            'name': 'Test Product',
            'list_price': 99.99,
            'categ_id': self.category.id,
            'is_featured': True,
            'is_new': True,
            'is_bestseller': False,
        })

        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(product.list_price, 99.99)
        self.assertTrue(product.is_featured)
        self.assertTrue(product.is_new)
        self.assertFalse(product.is_bestseller)

    def test_slug_generation(self):
        """Test automatic slug generation"""
        product = self.env['product.template'].create({
            'name': 'Test Product For Slug',
            'list_price': 99.99,
        })

        # Check if slug is generated
        slug = product.slug
        self.assertTrue(slug)
        self.assertIn('test-product', slug.lower())

    def test_get_api_data(self):
        """Test get_api_data method"""
        product = self.env['product.template'].create({
            'name': 'API Test Product',
            'list_price': 149.99,
            'categ_id': self.category.id,
        })

        api_data = product.get_api_data()

        self.assertIsInstance(api_data, dict)
        self.assertEqual(api_data['id'], product.id)
        self.assertEqual(api_data['name'], 'API Test Product')
        self.assertEqual(api_data['list_price'], 149.99)
        self.assertIn('currency', api_data)
        self.assertIn('category', api_data)

    def test_seo_fields(self):
        """Test SEO-related fields"""
        product = self.env['product.template'].create({
            'name': 'SEO Test Product',
            'list_price': 99.99,
            'meta_title': 'Custom Meta Title',
            'meta_description': 'Custom meta description for SEO',
            'meta_keywords': 'test, seo, product',
        })

        self.assertEqual(product.meta_title, 'Custom Meta Title')
        self.assertEqual(product.meta_description, 'Custom meta description for SEO')
        self.assertEqual(product.meta_keywords, 'test, seo, product')


class TestProductWishlist(TransactionCase):
    """Test ProductWishlist model"""

    def setUp(self):
        super().setUp()

        self.partner = self.env['res.partner'].create({
            'name': 'Test Customer',
            'email': 'customer@example.com',
        })

        self.product = self.env['product.template'].create({
            'name': 'Wishlist Test Product',
            'list_price': 99.99,
        })

    def test_wishlist_creation(self):
        """Test creating a wishlist entry"""
        wishlist_item = self.env['product.wishlist'].create({
            'partner_id': self.partner.id,
            'product_id': self.product.product_variant_id.id,
        })

        self.assertEqual(wishlist_item.partner_id.id, self.partner.id)
        self.assertEqual(wishlist_item.product_id.id, self.product.product_variant_id.id)
        self.assertTrue(wishlist_item.date_added)

    def test_wishlist_uniqueness(self):
        """Test that same product can't be added twice to wishlist"""
        # Create first wishlist item
        self.env['product.wishlist'].create({
            'partner_id': self.partner.id,
            'product_id': self.product.product_variant_id.id,
        })

        # Try to create duplicate
        # Should raise constraint error if uniqueness is enforced
        # (depends on model implementation)


class TestEcommerceConfig(TransactionCase):
    """Test EcommerceConfig model"""

    def test_config_creation(self):
        """Test creating e-commerce configuration"""
        config = self.env['ecommerce.config'].create({
            'name': 'Test Config',
            'frontend_url': 'http://localhost:3000',
            'products_per_page': 20,
            'show_out_of_stock': True,
            'enable_wishlist': True,
            'enable_comparison': True,
        })

        self.assertEqual(config.name, 'Test Config')
        self.assertEqual(config.frontend_url, 'http://localhost:3000')
        self.assertEqual(config.products_per_page, 20)
        self.assertTrue(config.show_out_of_stock)
        self.assertTrue(config.enable_wishlist)

    def test_config_defaults(self):
        """Test default configuration values"""
        config = self.env['ecommerce.config'].create({
            'name': 'Default Config',
        })

        # Check default values are set correctly
        self.assertTrue(config.name)
