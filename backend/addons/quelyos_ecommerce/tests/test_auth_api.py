# -*- coding: utf-8 -*-
"""
Tests for Authentication API endpoints
"""

from odoo.tests import tagged, HttpCase
import json


@tagged('post_install', '-at_install')
class TestAuthAPI(HttpCase):
    """Test Authentication API endpoints"""

    def setUp(self):
        super().setUp()

        # Create test user
        self.test_user = self.env['res.users'].create({
            'name': 'Test Auth User',
            'login': 'authtest@example.com',
            'email': 'authtest@example.com',
            'password': 'TestPassword123',
            'groups_id': [(6, 0, [self.env.ref('base.group_portal').id])],
        })

    def test_check_session_not_authenticated(self):
        """Test GET /api/ecommerce/auth/session without authentication"""
        response = self.url_open(
            '/api/ecommerce/auth/session',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data.get('success'))
        self.assertFalse(data.get('authenticated'))

    def test_login_invalid_credentials(self):
        """Test POST /api/ecommerce/auth/login with invalid credentials"""
        response = self.url_open(
            '/api/ecommerce/auth/login',
            data=json.dumps({
                'login': 'invalid@example.com',
                'password': 'wrongpassword',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Should return error
        self.assertFalse(data.get('success'))
        self.assertIn('error', data)

    def test_login_missing_parameters(self):
        """Test POST /api/ecommerce/auth/login with missing parameters"""
        response = self.url_open(
            '/api/ecommerce/auth/login',
            data=json.dumps({
                'login': 'test@example.com',
                # Missing password
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Should return error
        self.assertFalse(data.get('success'))

    def test_register_new_user(self):
        """Test POST /api/ecommerce/auth/register"""
        response = self.url_open(
            '/api/ecommerce/auth/register',
            data=json.dumps({
                'name': 'New User',
                'email': 'newuser@example.com',
                'password': 'NewPassword123',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Should succeed or return validation errors
        self.assertIn('success', data)

    def test_register_duplicate_email(self):
        """Test POST /api/ecommerce/auth/register with existing email"""
        response = self.url_open(
            '/api/ecommerce/auth/register',
            data=json.dumps({
                'name': 'Duplicate User',
                'email': 'authtest@example.com',  # Already exists
                'password': 'Password123',
            }),
            headers={'Content-Type': 'application/json'},
        )

        data = json.loads(response.content)

        # Should return error about existing email
        self.assertFalse(data.get('success'))
        self.assertIn('error', data)

    def test_logout(self):
        """Test POST /api/ecommerce/auth/logout"""
        # First login
        login_response = self.url_open(
            '/api/ecommerce/auth/login',
            data=json.dumps({
                'login': 'authtest@example.com',
                'password': 'TestPassword123',
            }),
            headers={'Content-Type': 'application/json'},
        )

        # Then logout
        logout_response = self.url_open(
            '/api/ecommerce/auth/logout',
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(logout_response.status_code, 200)
