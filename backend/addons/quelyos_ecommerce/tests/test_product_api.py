# -*- coding: utf-8 -*-
"""
Tests for Product API endpoints
"""

from odoo.tests import tagged, HttpCase
import json


@tagged('post_install', '-at_install')
class TestProductAPI(HttpCase):
    """Test Product API endpoints"""

    def setUp(self):
        super().setUp()

        # Create test product category
        self.category = self.env['product.category'].create({
            'name': 'Test Category',
        })

        # Create test products
        self.product1 = self.env['product.template'].create({
            'name': 'Test Product 1',
            'list_price': 99.99,
            'categ_id': self.category.id,
            'is_featured': True,
            'is_new': True,
        })

        self.product2 = self.env['product.template'].create({
            'name': 'Test Product 2',
            'list_price': 149.99,
            'categ_id': self.category.id,
            'is_featured': False,
        })

    def test_get_products_list(self):
        """Test GET /api/ecommerce/products"""
        response = self.url_open(
            '/api/ecommerce/products',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertIn('products', data)
        self.assertIsInstance(data['products'], list)
        self.assertGreaterEqual(len(data['products']), 2)

    def test_get_product_by_id(self):
        """Test GET /api/ecommerce/products/:id"""
        response = self.url_open(
            f'/api/ecommerce/products/{self.product1.id}',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertIn('product', data)
        self.assertEqual(data['product']['id'], self.product1.id)
        self.assertEqual(data['product']['name'], 'Test Product 1')

    def test_get_product_by_slug(self):
        """Test GET /api/ecommerce/products/slug/:slug"""
        # First, get the product's slug
        product_data = self.product1.get_api_data()
        slug = product_data.get('slug')

        if slug:
            response = self.url_open(
                f'/api/ecommerce/products/slug/{slug}',
                headers={'Content-Type': 'application/json'},
            )

            self.assertEqual(response.status_code, 200)
            data = json.loads(response.content)

            self.assertTrue(data.get('success'))
            self.assertEqual(data['product']['slug'], slug)

    def test_filter_products_by_category(self):
        """Test products filtering by category"""
        response = self.url_open(
            f'/api/ecommerce/products?category_id={self.category.id}',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        # All products should be from test category
        for product in data['products']:
            if product.get('category'):
                self.assertEqual(product['category']['id'], self.category.id)

    def test_filter_products_by_price(self):
        """Test products filtering by price range"""
        response = self.url_open(
            '/api/ecommerce/products?price_min=100&price_max=200',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        # All products should be in price range
        for product in data['products']:
            price = product.get('list_price', 0)
            self.assertGreaterEqual(price, 100)
            self.assertLessEqual(price, 200)

    def test_search_products(self):
        """Test product search"""
        response = self.url_open(
            '/api/ecommerce/products?search=Test Product 1',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        # Should find at least product1
        product_names = [p['name'] for p in data['products']]
        self.assertIn('Test Product 1', product_names)

    def test_filter_featured_products(self):
        """Test filtering featured products"""
        response = self.url_open(
            '/api/ecommerce/products?is_featured=true',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        # All returned products should be featured
        for product in data['products']:
            self.assertTrue(product.get('is_featured'))

    def test_pagination(self):
        """Test products pagination"""
        response = self.url_open(
            '/api/ecommerce/products?limit=1&offset=0',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertEqual(len(data['products']), 1)
        self.assertIn('total', data)

    def test_product_data_format(self):
        """Test that product data matches TypeScript Product interface"""
        product_data = self.product1.get_api_data()

        # Required fields from TypeScript interface
        required_fields = ['id', 'name', 'slug', 'description', 'list_price',
                          'currency', 'is_featured', 'is_new', 'is_bestseller',
                          'images', 'category', 'in_stock', 'stock_qty', 'seo']

        for field in required_fields:
            self.assertIn(field, product_data, f"Field '{field}' missing from product data")

        # Validate currency structure
        currency = product_data['currency']
        self.assertIn('id', currency)
        self.assertIn('code', currency)
        self.assertIn('symbol', currency)

        # Validate images structure
        images = product_data['images']
        self.assertIsInstance(images, list)
        if images:
            img = images[0]
            self.assertIn('id', img)
            self.assertIn('url', img)
            self.assertIn('alt', img)
            self.assertIn('is_main', img)

        # Validate category structure (if exists)
        category = product_data.get('category')
        if category:
            self.assertIn('id', category)
            self.assertIn('name', category)
            self.assertIn('slug', category)

        # Validate SEO structure
        seo = product_data['seo']
        self.assertIn('slug', seo)
        self.assertIn('meta_title', seo)
        self.assertIn('meta_description', seo)

    def test_products_list_with_facets(self):
        """Test that products list includes facets for filtering"""
        response = self.url_open(
            '/api/ecommerce/products',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertIn('facets', data)

        # Validate facets structure
        facets = data['facets']
        self.assertIn('categories', facets)
        self.assertIn('price_range', facets)
        self.assertIn('attributes', facets)

        # Validate price_range
        price_range = facets['price_range']
        self.assertIn('min', price_range)
        self.assertIn('max', price_range)

        # Validate categories (if any)
        if facets['categories']:
            cat = facets['categories'][0]
            self.assertIn('id', cat)
            self.assertIn('name', cat)
            self.assertIn('slug', cat)
            self.assertIn('count', cat)
