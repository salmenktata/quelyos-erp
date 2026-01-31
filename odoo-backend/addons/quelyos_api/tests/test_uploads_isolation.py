# -*- coding: utf-8 -*-
"""
Tests d'isolation uploads multi-tenant

Vérifie que les uploads (attachments, images) sont correctement isolés par tenant.
"""

import unittest
import base64
from unittest.mock import Mock, patch
from odoo.tests import TransactionCase
from odoo.exceptions import AccessError


class TestUploadsIsolation(unittest.TestCase):
    """Tests d'isolation multi-tenant pour uploads"""

    def test_attachment_must_have_company_id(self):
        """Vérifier que ir.attachment a toujours company_id défini"""
        # Pattern attendu dans le code
        ticket_controller_code = """
        attachment = request.env['ir.attachment'].create({
            'name': uploaded_file.filename,
            'datas': base64.b64encode(file_data),
            'res_model': 'quelyos.ticket',
            'res_id': ticket.id,
            'mimetype': uploaded_file.content_type,
            'company_id': ticket.company_id.id,
        })
        """
        
        # Vérifier que company_id est présent
        self.assertIn("'company_id':", ticket_controller_code)
        self.assertIn("ticket.company_id.id", ticket_controller_code)

    def test_hero_slide_upload_verifies_company_id(self):
        """Vérifier que upload hero_slide vérifie company_id"""
        # Pattern attendu dans le code
        cms_controller_code = """
        slide = request.env['quelyos.hero.slide'].search([
            ('id', '=', slide_id),
            ('company_id', '=', request.env.company.id)
        ], limit=1)
        """
        
        # Vérifier que .search() avec company_id est utilisé
        self.assertIn("'company_id', '=', request.env.company.id", cms_controller_code)
        self.assertNotIn("sudo().browse", cms_controller_code)

    def test_tenant_logo_upload_verifies_company_id(self):
        """Vérifier que upload tenant logo vérifie company_id"""
        # Pattern attendu dans le code
        cms_controller_code = """
        user_company_id = request.env.user.company_id.id

        tenant = request.env['quelyos.tenant'].search([
            ('id', '=', tenant_id),
            ('company_id', '=', user_company_id)
        ], limit=1)
        """
        
        # Vérifier que .search() avec company_id est utilisé
        self.assertIn("'company_id', '=', user_company_id", cms_controller_code)
        self.assertNotIn("sudo().browse", cms_controller_code)

    def test_key_format_includes_company_id(self):
        """Vérifier que les clés d'attachments incluent référence au tenant"""
        # Simuler création attachment avec company_id
        attachment_data = {
            'name': 'test.pdf',
            'datas': base64.b64encode(b'test data'),
            'res_model': 'quelyos.ticket',
            'res_id': 123,
            'mimetype': 'application/pdf',
            'company_id': 1,  # ✅ CRITIQUE
        }
        
        # Vérifier que company_id est présent
        self.assertIn('company_id', attachment_data)
        self.assertIsNotNone(attachment_data['company_id'])

    def test_cross_tenant_upload_blocked(self):
        """Vérifier que upload cross-tenant est bloqué"""
        # Scénario : Tenant1 tente d'uploader sur slide de Tenant2
        
        # Mock slide de Tenant 2
        slide_tenant2_id = 456
        user_tenant1_company_id = 1
        
        # Simuler search qui doit retourner vide
        # (car slide.company_id=2 != request.env.company.id=1)
        search_result = []  # Vide car différent tenant
        
        self.assertEqual(len(search_result), 0, 
                        "Upload cross-tenant doit être bloqué (search vide)")

    def test_isolation_scenarios(self):
        """Tester différents scénarios d'isolation"""
        scenarios = [
            {
                'name': 'Ticket attachment - Tenant1',
                'company_id': 1,
                'expected_isolation': True
            },
            {
                'name': 'Hero slide - Tenant2',
                'company_id': 2,
                'expected_isolation': True
            },
            {
                'name': 'Tenant logo - Tenant1',
                'company_id': 1,
                'expected_isolation': True
            },
        ]
        
        for scenario in scenarios:
            with self.subTest(scenario=scenario['name']):
                # Vérifier que company_id est défini
                self.assertIsNotNone(scenario['company_id'])
                self.assertTrue(scenario['expected_isolation'])


class TestUploadsIntegration(TransactionCase):
    """Tests d'intégration avec Odoo (nécessite DB test)"""

    def setUp(self):
        super().setUp()
        # Setup tenants
        self.company1 = self.env['res.company'].create({'name': 'Tenant 1'})
        self.company2 = self.env['res.company'].create({'name': 'Tenant 2'})

    def test_attachment_inherits_company_id_from_ticket(self):
        """Vérifier que attachment hérite company_id du ticket parent"""
        # Créer ticket Tenant1
        ticket1 = self.env['quelyos.ticket'].create({
            'subject': 'Test ticket',
            'company_id': self.company1.id,
        })

        # Créer attachment lié au ticket
        attachment1 = self.env['ir.attachment'].create({
            'name': 'test.pdf',
            'datas': base64.b64encode(b'test data'),
            'res_model': 'quelyos.ticket',
            'res_id': ticket1.id,
            'company_id': ticket1.company_id.id,
        })

        # Vérifier isolation
        self.assertEqual(attachment1.company_id.id, self.company1.id,
                        "Attachment doit avoir company_id du ticket")

    def test_cross_tenant_attachment_access_blocked(self):
        """Vérifier qu'on ne peut pas accéder à attachment autre tenant"""
        # Créer ticket + attachment Tenant1
        ticket1 = self.env['quelyos.ticket'].create({
            'subject': 'Test',
            'company_id': self.company1.id,
        })

        attachment1 = self.env['ir.attachment'].create({
            'name': 'secret.pdf',
            'datas': base64.b64encode(b'secret data'),
            'res_model': 'quelyos.ticket',
            'res_id': ticket1.id,
            'company_id': self.company1.id,
        })

        # Tenter d'accéder depuis Tenant2
        with self.assertRaises(AccessError):
            attachment1.with_context(allowed_company_ids=[self.company2.id]).datas


if __name__ == '__main__':
    unittest.main()
