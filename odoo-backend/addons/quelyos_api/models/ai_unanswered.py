# -*- coding: utf-8 -*-
"""
Modèle pour tracker les questions sans réponse FAQ.
Permet d'analyser les questions fréquentes et d'enrichir la FAQ.
"""
from odoo import models, fields, api


class AiUnanswered(models.Model):
    _name = 'quelyos.ai.unanswered'
    _description = 'Questions sans réponse FAQ'
    _order = 'frequency desc, create_date desc'

    message = fields.Text(
        string='Message',
        required=True,
        help='Message de l\'utilisateur'
    )
    user_ip = fields.Char(
        string='IP Utilisateur',
        help='Adresse IP de l\'utilisateur (anonymisée)'
    )
    frequency = fields.Integer(
        string='Fréquence',
        default=1,
        help='Nombre de fois où cette question a été posée'
    )
    create_date = fields.Datetime(
        string='Date',
        readonly=True,
        help='Date de la première occurrence'
    )
    last_occurrence = fields.Datetime(
        string='Dernière Occurrence',
        help='Date de la dernière fois où cette question a été posée'
    )
    is_reviewed = fields.Boolean(
        string='Révisé',
        default=False,
        help='Question examinée par l\'équipe'
    )
    should_add_faq = fields.Boolean(
        string='Ajouter à la FAQ',
        default=False,
        help='Question à ajouter à la FAQ'
    )
    notes = fields.Text(
        string='Notes',
        help='Notes internes sur cette question'
    )

    @api.model
    def log_unanswered_question(self, message: str, user_ip: str = None):
        """
        Log une question qui n'a pas trouvé de réponse FAQ.
        Incrémente la fréquence si la question existe déjà.

        Args:
            message: Message de l'utilisateur
            user_ip: Adresse IP (optionnel, anonymisé)

        Returns:
            record: Enregistrement créé ou mis à jour
        """
        # Normaliser le message pour détecter les doublons
        normalized_message = message.strip().lower()

        # Chercher si question similaire existe
        existing = self.search([
            ('message', '=ilike', f'%{normalized_message[:100]}%')
        ], limit=1)

        if existing:
            # Incrémenter la fréquence
            existing.write({
                'frequency': existing.frequency + 1,
                'last_occurrence': fields.Datetime.now()
            })
            return existing
        else:
            # Créer nouvelle entrée
            return self.create({
                'message': message,
                'user_ip': user_ip,
                'frequency': 1,
                'last_occurrence': fields.Datetime.now()
            })

    @api.model
    def get_top_questions(self, limit: int = 10):
        """
        Retourne les questions les plus fréquentes non révisées.

        Args:
            limit: Nombre de questions à retourner

        Returns:
            list: Liste de questions avec métadonnées
        """
        questions = self.search([
            ('is_reviewed', '=', False)
        ], limit=limit, order='frequency desc')

        return [{
            'id': q.id,
            'message': q.message,
            'frequency': q.frequency,
            'last_occurrence': q.last_occurrence.isoformat() if q.last_occurrence else None
        } for q in questions]
