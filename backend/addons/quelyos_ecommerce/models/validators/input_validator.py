# -*- coding: utf-8 -*-

from odoo import models, api, _
from odoo.exceptions import ValidationError
import re
import html


class InputValidator(models.AbstractModel):
    """
    Framework de validation d'inputs pour l'API E-commerce.

    Fournit des méthodes de validation réutilisables pour tous types d'inputs:
    - Emails
    - Téléphones
    - Nombres (entiers, décimaux, positifs)
    - Prix
    - HTML (sanitization XSS)
    - Et plus...

    Usage:
        validator = request.env['input.validator']
        email = validator.validate_email(params.get('email'))
        quantity = validator.validate_positive_int(params.get('quantity'), 'Quantité')
    """

    _name = 'input.validator'
    _description = 'Input Validation Framework'

    @api.model
    def validate_email(self, email):
        """
        Valide et normalise une adresse email.

        Args:
            email: Adresse email à valider

        Returns:
            str: Email normalisé (lowercase, stripped)

        Raises:
            ValidationError: Si email invalide
        """
        if not email:
            raise ValidationError(_("Email requis"))

        # Normaliser
        email = str(email).strip().lower()

        # Pattern RFC 5322 simplifié
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        if not re.match(pattern, email):
            raise ValidationError(_("Format email invalide: %(email)s", email=email))

        # Longueur maximale
        if len(email) > 254:  # RFC 5321
            raise ValidationError(_("Email trop long (max 254 caractères)"))

        return email

    @api.model
    def validate_phone(self, phone):
        """
        Valide et normalise un numéro de téléphone.

        Args:
            phone: Numéro de téléphone

        Returns:
            str: Téléphone normalisé (chiffres et + seulement)

        Raises:
            ValidationError: Si téléphone invalide
        """
        if not phone:
            return ''

        # Garder seulement chiffres et +
        cleaned = re.sub(r'[^0-9+]', '', str(phone))

        # Validation longueur minimale
        if len(cleaned) < 8:
            raise ValidationError(_("Numéro de téléphone trop court (minimum 8 chiffres)"))

        # Validation longueur maximale
        if len(cleaned) > 20:
            raise ValidationError(_("Numéro de téléphone trop long (maximum 20 caractères)"))

        # Validation format: + autorisé seulement au début
        if '+' in cleaned and not cleaned.startswith('+'):
            raise ValidationError(_("Le symbole + doit être au début du numéro"))

        if cleaned.count('+') > 1:
            raise ValidationError(_("Un seul symbole + autorisé"))

        return cleaned

    @api.model
    def validate_positive_int(self, value, field_name="valeur"):
        """
        Valide un entier positif.

        Args:
            value: Valeur à valider
            field_name: Nom du champ (pour message d'erreur)

        Returns:
            int: Valeur validée

        Raises:
            ValidationError: Si valeur invalide
        """
        try:
            int_value = int(value)
        except (TypeError, ValueError):
            raise ValidationError(
                _(f"{field_name} doit être un nombre entier")
            )

        if int_value < 0:
            raise ValidationError(
                _(f"{field_name} doit être positif ou zéro")
            )

        return int_value

    @api.model
    def validate_positive_float(self, value, field_name="valeur", decimals=2):
        """
        Valide un nombre décimal positif.

        Args:
            value: Valeur à valider
            field_name: Nom du champ
            decimals: Nombre de décimales à arrondir

        Returns:
            float: Valeur validée et arrondie

        Raises:
            ValidationError: Si valeur invalide
        """
        try:
            float_value = float(value)
        except (TypeError, ValueError):
            raise ValidationError(
                _(f"{field_name} doit être un nombre")
            )

        if float_value < 0:
            raise ValidationError(
                _(f"{field_name} doit être positif ou zéro")
            )

        return round(float_value, decimals)

    @api.model
    def validate_quantity(self, quantity):
        """
        Valide une quantité de produit.

        Args:
            quantity: Quantité à valider

        Returns:
            int: Quantité validée

        Raises:
            ValidationError: Si quantité invalide
        """
        qty = self.validate_positive_int(quantity, "Quantité")

        if qty == 0:
            raise ValidationError(_("La quantité doit être supérieure à zéro"))

        if qty > 10000:  # Protection contre abus
            raise ValidationError(_("Quantité trop élevée (maximum 10000)"))

        return qty

    @api.model
    def validate_price(self, price):
        """
        Valide un prix.

        Args:
            price: Prix à valider

        Returns:
            float: Prix validé et arrondi à 2 décimales

        Raises:
            ValidationError: Si prix invalide
        """
        price_float = self.validate_positive_float(price, "Prix", decimals=2)

        if price_float > 1000000:  # Protection contre abus
            raise ValidationError(_("Prix trop élevé (maximum 1,000,000)"))

        return price_float

    @api.model
    def sanitize_html(self, html_string):
        """
        Nettoie une chaîne HTML pour prévenir XSS.

        Args:
            html_string: Chaîne HTML à nettoyer

        Returns:
            str: Chaîne HTML échappée (safe)

        Note:
            Pour un nettoyage plus avancé (autoriser certaines balises),
            utiliser la bibliothèque 'bleach' (à installer).
        """
        if not html_string:
            return ''

        # Échapper tous les caractères HTML spéciaux
        return html.escape(str(html_string))

    @api.model
    def validate_string(self, value, field_name="champ", min_length=0, max_length=None, required=False):
        """
        Valide une chaîne de caractères.

        Args:
            value: Valeur à valider
            field_name: Nom du champ
            min_length: Longueur minimale
            max_length: Longueur maximale
            required: Si True, la valeur ne peut pas être vide

        Returns:
            str: Valeur validée et nettoyée

        Raises:
            ValidationError: Si validation échoue
        """
        if value is None:
            value = ''

        value = str(value).strip()

        if required and not value:
            raise ValidationError(_(f"{field_name} est requis"))

        if len(value) < min_length:
            raise ValidationError(
                _(f"{field_name} doit contenir au moins {min_length} caractères")
            )

        if max_length and len(value) > max_length:
            raise ValidationError(
                _(f"{field_name} ne peut pas dépasser {max_length} caractères")
            )

        return value

    @api.model
    def validate_id(self, record_id, field_name="ID"):
        """
        Valide un ID de record Odoo.

        Args:
            record_id: ID à valider
            field_name: Nom du champ

        Returns:
            int: ID validé

        Raises:
            ValidationError: Si ID invalide
        """
        return self.validate_positive_int(record_id, field_name)

    @api.model
    def validate_ids_list(self, ids_list, field_name="IDs"):
        """
        Valide une liste d'IDs.

        Args:
            ids_list: Liste d'IDs
            field_name: Nom du champ

        Returns:
            list: Liste d'IDs validés

        Raises:
            ValidationError: Si liste invalide
        """
        if not isinstance(ids_list, (list, tuple)):
            raise ValidationError(
                _(f"{field_name} doit être une liste")
            )

        validated_ids = []
        for item in ids_list:
            validated_ids.append(self.validate_id(item, field_name))

        return validated_ids

    @api.model
    def validate_boolean(self, value, field_name="champ"):
        """
        Valide et convertit une valeur booléenne.

        Args:
            value: Valeur à valider (peut être string, int, bool)
            field_name: Nom du champ

        Returns:
            bool: Valeur booléenne

        Note:
            Accepte: True, False, 1, 0, "true", "false", "1", "0"
        """
        if isinstance(value, bool):
            return value

        if isinstance(value, int):
            return bool(value)

        if isinstance(value, str):
            lower_value = value.lower().strip()
            if lower_value in ('true', '1', 'yes', 'y'):
                return True
            if lower_value in ('false', '0', 'no', 'n', ''):
                return False

        raise ValidationError(
            _(f"{field_name} doit être un booléen (true/false)")
        )
