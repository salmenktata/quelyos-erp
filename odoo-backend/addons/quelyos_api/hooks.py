# -*- coding: utf-8 -*-
"""
Hooks d'installation/mise à jour du module quelyos_api
"""
import logging

_logger = logging.getLogger(__name__)


def post_init_hook(env):
    """
    Hook exécuté après installation/upgrade du module
    Crée les templates email qui ne peuvent pas être chargés via XML
    """
    _logger.info("=== Post-init hook quelyos_api ===")
    _create_satisfaction_email_template(env)


def _create_satisfaction_email_template(env):
    """
    Crée le template email de satisfaction
    Workaround pour problème validation XML RelaxNG avec contenu HTML complexe
    """
    template_xmlid = 'quelyos_api.email_template_satisfaction_request'

    # Vérifier si template existe déjà
    existing = env.ref(template_xmlid, raise_if_not_found=False)
    if existing:
        _logger.info(f"Template satisfaction déjà existant (ID {existing.id}), mise à jour...")
        template = existing
    else:
        _logger.info("Création du template satisfaction...")
        template = env['mail.template'].create({
            'name': 'Demande de Satisfaction - Ticket Résolu',
            'model_id': env.ref('quelyos_api.model_quelyos_ticket').id,
        })
        # Créer l'external ID
        env['ir.model.data'].create({
            'name': 'email_template_satisfaction_request',
            'module': 'quelyos_api',
            'model': 'mail.template',
            'res_id': template.id,
        })

    # Définir le contenu du template
    template.write({
        'subject': 'Votre ticket ${object.name} a été résolu - Donnez-nous votre avis',
        'email_from': '${object.company_id.email or user.email_formatted}',
        'email_to': '${object.partner_id.email}',
        'description': 'Email automatique envoyé au client après résolution d\'un ticket pour collecter sa satisfaction',
        'body_html': '''
<div style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎉 Votre ticket a été résolu !
            </h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${object.partner_id.name}</strong>,
            </p>

            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Bonne nouvelle ! Votre ticket <strong>${object.name}</strong> concernant "<em>${object.subject}</em>" a été résolu par notre équipe.
            </p>

            <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #0f766e; font-weight: 600; font-size: 14px;">
                    Résumé de votre ticket
                </p>
                <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;">
                    <strong>Référence :</strong> ${object.name}
                </p>
                <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;">
                    <strong>Catégorie :</strong> ${dict(object._fields['category']._description_selection(object.env)).get(object.category)}
                </p>
                <p style="margin: 0; color: #374151; font-size: 14px;">
                    <strong>Résolu le :</strong> ${object.resolution_date.strftime('%d/%m/%Y à %H:%M') if object.resolution_date else 'Aujourd\\'hui'}
                </p>
            </div>

            <p style="margin: 24px 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                <strong>Nous aimerions connaître votre avis !</strong>
            </p>

            <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Votre satisfaction est notre priorité. Prenez quelques secondes pour nous donner votre avis sur la résolution de votre demande.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="${ctx.get('satisfaction_url')}"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
                    ⭐ Donner mon avis
                </a>
            </div>

            <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">
                Ce lien est valable pendant 30 jours. Votre avis nous aide à améliorer la qualité de notre support.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                Vous recevez cet email car votre ticket a été résolu.
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${datetime.datetime.now().year} ${object.company_id.name or 'Quelyos'}. Tous droits réservés.
            </p>
        </div>
    </div>
</div>
''',
        'auto_delete': False,
        'lang': '${object.partner_id.lang}',
    })

    env.cr.commit()
    _logger.info(f"✅ Template satisfaction créé/mis à jour (ID {template.id})")
