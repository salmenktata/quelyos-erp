# -*- coding: utf-8 -*-

from odoo import models, api, _
from odoo.exceptions import ValidationError


class PartnerValidator(models.AbstractModel):
    """
    Validation framework pour la création/modification de partners.

    Protège contre les attaques de type "mass assignment" où un utilisateur
    malveillant pourrait injecter des champs non autorisés dans les requêtes API.

    Usage:
        validator = request.env['partner.validator']
        validated_data = validator.validate_registration_data(params)
        partner = request.env['res.partner'].sudo().create(validated_data)
    """

    _name = 'partner.validator'
    _description = 'Partner Input Validator'

    # Whitelist des champs autorisés pour l'inscription client
    ALLOWED_REGISTRATION_FIELDS = {
        'name',
        'email',
        'phone',
        'mobile',
        'street',
        'street2',
        'city',
        'zip',
        'state_id',
        'country_id',
        'lang',
    }

    # Whitelist des champs autorisés pour la mise à jour du profil
    ALLOWED_UPDATE_FIELDS = {
        'name',
        'phone',
        'mobile',
        'street',
        'street2',
        'city',
        'zip',
        'state_id',
        'country_id',
        'lang',
    }

    @api.model
    def validate_registration_data(self, data):
        """
        Valide et filtre les données d'inscription client.

        Args:
            data: Dictionnaire de données d'inscription

        Returns:
            dict: Données validées et sécurisées

        Raises:
            ValidationError: Si données invalides
        """
        if not data:
            raise ValidationError(_("Données d'inscription manquantes"))

        # Étape 1: Filtrer les champs (whitelist)
        filtered_data = {
            k: v for k, v in data.items()
            if k in self.ALLOWED_REGISTRATION_FIELDS
        }

        # Étape 2: Valider les champs requis
        if not filtered_data.get('name'):
            raise ValidationError(_("Le nom est requis"))

        if not filtered_data.get('email'):
            raise ValidationError(_("L'email est requis"))

        # Étape 3: Valider et normaliser l'email
        input_validator = self.env['input.validator']
        filtered_data['email'] = input_validator.validate_email(filtered_data['email'])

        # Étape 4: Vérifier unicité de l'email
        existing_partner = self.env['res.partner'].sudo().search([
            ('email', '=', filtered_data['email'])
        ], limit=1)

        if existing_partner:
            raise ValidationError(_("Un compte avec cet email existe déjà"))

        # Étape 5: Valider et normaliser le téléphone
        if filtered_data.get('phone'):
            filtered_data['phone'] = input_validator.validate_phone(filtered_data['phone'])

        if filtered_data.get('mobile'):
            filtered_data['mobile'] = input_validator.validate_phone(filtered_data['mobile'])

        # Étape 6: Valider nom (min/max length)
        name = filtered_data.get('name', '')
        if len(name) < 2:
            raise ValidationError(_("Le nom doit contenir au moins 2 caractères"))

        if len(name) > 100:
            raise ValidationError(_("Le nom ne peut pas dépasser 100 caractères"))

        # Étape 7: Valider country_id et state_id si fournis
        if filtered_data.get('country_id'):
            country = self.env['res.country'].sudo().browse(filtered_data['country_id'])
            if not country.exists():
                raise ValidationError(_("Pays invalide"))

        if filtered_data.get('state_id'):
            state = self.env['res.country.state'].sudo().browse(filtered_data['state_id'])
            if not state.exists():
                raise ValidationError(_("État/Province invalide"))

        # Étape 8: Forcer certains champs pour la sécurité
        filtered_data['customer_rank'] = 1  # Marquer comme client
        filtered_data['is_company'] = False  # Toujours personne physique
        filtered_data['active'] = True

        return filtered_data

    @api.model
    def validate_update_data(self, data, partner_id):
        """
        Valide et filtre les données de mise à jour du profil.

        Args:
            data: Dictionnaire de données à mettre à jour
            partner_id: ID du partner à mettre à jour

        Returns:
            dict: Données validées et sécurisées

        Raises:
            ValidationError: Si données invalides
        """
        if not data:
            raise ValidationError(_("Données de mise à jour manquantes"))

        # Vérifier que le partner existe
        partner = self.env['res.partner'].sudo().browse(partner_id)
        if not partner.exists():
            raise ValidationError(_("Partner non trouvé"))

        # Étape 1: Filtrer les champs (whitelist - email exclu pour update)
        filtered_data = {
            k: v for k, v in data.items()
            if k in self.ALLOWED_UPDATE_FIELDS
        }

        # Note: email est EXCLU des champs modifiables pour éviter les conflits

        # Étape 2: Valider nom si fourni
        if 'name' in filtered_data:
            name = filtered_data['name']
            if len(name) < 2:
                raise ValidationError(_("Le nom doit contenir au moins 2 caractères"))
            if len(name) > 100:
                raise ValidationError(_("Le nom ne peut pas dépasser 100 caractères"))

        # Étape 3: Valider téléphones si fournis
        input_validator = self.env['input.validator']

        if 'phone' in filtered_data and filtered_data['phone']:
            filtered_data['phone'] = input_validator.validate_phone(filtered_data['phone'])

        if 'mobile' in filtered_data and filtered_data['mobile']:
            filtered_data['mobile'] = input_validator.validate_phone(filtered_data['mobile'])

        # Étape 4: Valider country_id et state_id si fournis
        if 'country_id' in filtered_data and filtered_data['country_id']:
            country = self.env['res.country'].sudo().browse(filtered_data['country_id'])
            if not country.exists():
                raise ValidationError(_("Pays invalide"))

        if 'state_id' in filtered_data and filtered_data['state_id']:
            state = self.env['res.country.state'].sudo().browse(filtered_data['state_id'])
            if not state.exists():
                raise ValidationError(_("État/Province invalide"))

        # Étape 5: Nettoyer les valeurs None/vides pour les champs optionnels
        # (Odoo ORM gère mieux les absences que les None explicites)
        filtered_data = {k: v for k, v in filtered_data.items() if v is not None and v != ''}

        return filtered_data

    @api.model
    def validate_address_data(self, data):
        """
        Valide les données d'adresse (pour création adresse de livraison/facturation).

        Args:
            data: Dictionnaire de données d'adresse

        Returns:
            dict: Données d'adresse validées

        Raises:
            ValidationError: Si données invalides
        """
        allowed_fields = {
            'name',
            'street',
            'street2',
            'city',
            'zip',
            'state_id',
            'country_id',
            'phone',
            'mobile',
        }

        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}

        # Valider champs requis pour une adresse
        if not filtered_data.get('street'):
            raise ValidationError(_("L'adresse (rue) est requise"))

        if not filtered_data.get('city'):
            raise ValidationError(_("La ville est requise"))

        if not filtered_data.get('country_id'):
            raise ValidationError(_("Le pays est requis"))

        # Valider country_id
        country = self.env['res.country'].sudo().browse(filtered_data['country_id'])
        if not country.exists():
            raise ValidationError(_("Pays invalide"))

        # Valider state_id si fourni
        if filtered_data.get('state_id'):
            state = self.env['res.country.state'].sudo().browse(filtered_data['state_id'])
            if not state.exists():
                raise ValidationError(_("État/Province invalide"))

        # Valider téléphone si fourni
        input_validator = self.env['input.validator']
        if filtered_data.get('phone'):
            filtered_data['phone'] = input_validator.validate_phone(filtered_data['phone'])

        if filtered_data.get('mobile'):
            filtered_data['mobile'] = input_validator.validate_phone(filtered_data['mobile'])

        # Forcer type adresse
        filtered_data['type'] = 'delivery'  # ou 'invoice' selon le contexte

        return filtered_data

    @api.model
    def log_suspicious_fields(self, received_data, allowed_fields):
        """
        Log les champs suspects (tentative de mass assignment).

        Args:
            received_data: Données reçues de l'API
            allowed_fields: Set de champs autorisés
        """
        suspicious_fields = [
            field for field in received_data.keys()
            if field not in allowed_fields
        ]

        if suspicious_fields:
            import logging
            _logger = logging.getLogger(__name__)
            _logger.warning(
                f"Tentative de mass assignment détectée. "
                f"Champs suspects: {', '.join(suspicious_fields)}"
            )
