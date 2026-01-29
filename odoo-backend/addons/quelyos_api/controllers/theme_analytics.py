# -*- coding: utf-8 -*-
"""
Controller Analytics Marketplace Thèmes - Dashboard Admin

Endpoints:
- /api/themes/analytics/overview : Métriques générales marketplace
- /api/themes/analytics/top-themes : Top 5 thèmes les plus vendus
- /api/themes/analytics/top-designers : Top 5 designers par revenus
- /api/themes/analytics/sales-timeline : Évolution ventes par mois
- /api/themes/analytics/revenue-timeline : Évolution revenus par mois
- /api/themes/analytics/pending-tasks : Tâches en attente (validation, payouts)
"""

import logging
from datetime import datetime, timedelta
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class ThemeAnalyticsController(http.Controller):
    """Controller pour analytics marketplace thèmes (admin uniquement)"""

    def _require_admin(self):
        """Vérifier droits admin"""
        if not request.env.user.has_group('quelyos_api.group_quelyos_admin'):
            raise ValueError('Admin access required')

    @http.route('/api/themes/analytics/overview', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_marketplace_overview(self):
        """
        Métriques générales marketplace (ADMIN UNIQUEMENT)

        Returns:
            dict: {
                success: bool,
                overview: {
                    total_themes: int,
                    total_designers: int,
                    total_sales: int,
                    total_revenue: float,
                    platform_revenue: float (30%),
                    designer_revenue: float (70%),
                    pending_submissions: int,
                    pending_payouts: float,
                    avg_theme_price: float,
                    conversion_rate: float (sales / views)
                }
            }
        """
        try:
            self._require_admin()

            # Compter thèmes
            total_themes = request.env['quelyos.theme'].sudo().search_count([
                ('is_marketplace', '=', True),
                ('is_public', '=', True),
            ])

            # Compter designers
            total_designers = request.env['quelyos.theme.designer'].sudo().search_count([
                ('status', '=', 'approved')
            ])

            # Statistiques ventes
            purchases = request.env['quelyos.theme.purchase'].sudo().search([
                ('status', '=', 'completed')
            ])

            total_sales = len(purchases)
            total_revenue = sum(purchases.mapped('amount'))
            platform_revenue = sum(purchases.mapped('platform_share'))
            designer_revenue = sum(purchases.mapped('designer_share'))

            # Soumissions en attente
            pending_submissions = request.env['quelyos.theme.submission'].sudo().search_count([
                ('status', 'in', ['submitted', 'in_review'])
            ])

            # Payouts en attente
            pending_revenues = request.env['quelyos.theme.revenue'].sudo().search([
                ('payout_status', '=', 'pending')
            ])
            pending_payouts = sum(pending_revenues.mapped('amount'))

            # Prix moyen thèmes premium
            premium_themes = request.env['quelyos.theme'].sudo().search([
                ('is_marketplace', '=', True),
                ('is_premium', '=', True),
                ('price', '>', 0),
            ])
            avg_theme_price = sum(premium_themes.mapped('price')) / len(premium_themes) if premium_themes else 0

            # Taux de conversion (simplifié : ventes / thèmes actifs)
            conversion_rate = (total_sales / total_themes * 100) if total_themes > 0 else 0

            return {
                'success': True,
                'overview': {
                    'total_themes': total_themes,
                    'total_designers': total_designers,
                    'total_sales': total_sales,
                    'total_revenue': total_revenue,
                    'platform_revenue': platform_revenue,
                    'designer_revenue': designer_revenue,
                    'pending_submissions': pending_submissions,
                    'pending_payouts': pending_payouts,
                    'avg_theme_price': avg_theme_price,
                    'conversion_rate': round(conversion_rate, 2),
                }
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching marketplace overview: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/analytics/top-themes', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_top_themes(self, limit=5):
        """
        Top thèmes les plus vendus (ADMIN UNIQUEMENT)

        Args:
            limit (int): Nombre de thèmes à retourner (default: 5)

        Returns:
            dict: {
                success: bool,
                themes: [{
                    id, name, sales_count, total_revenue,
                    designer_name, category, thumbnail
                }]
            }
        """
        try:
            self._require_admin()

            # Récupérer soumissions avec statistiques
            submissions = request.env['quelyos.theme.submission'].sudo().search([
                ('status', '=', 'approved'),
            ], order='sales_count desc', limit=limit)

            themes_data = []
            for submission in submissions:
                themes_data.append({
                    'id': submission.theme_id.id if submission.theme_id else None,
                    'submission_id': submission.id,
                    'name': submission.name,
                    'sales_count': submission.sales_count,
                    'total_revenue': submission.total_revenue,
                    'designer_name': submission.designer_id.display_name if submission.designer_id else 'Unknown',
                    'category': submission.category,
                    'thumbnail': f'/web/image/quelyos.theme.submission/{submission.id}/thumbnail' if submission.thumbnail else None,
                    'average_rating': submission.average_rating,
                })

            return {
                'success': True,
                'themes': themes_data,
                'total': len(themes_data)
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching top themes: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/analytics/top-designers', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_top_designers(self, limit=5):
        """
        Top designers par revenus (ADMIN UNIQUEMENT)

        Args:
            limit (int): Nombre de designers à retourner (default: 5)

        Returns:
            dict: {
                success: bool,
                designers: [{
                    id, display_name, themes_count, total_sales,
                    total_revenue, average_rating, pending_balance
                }]
            }
        """
        try:
            self._require_admin()

            # Récupérer designers avec statistiques
            designers = request.env['quelyos.theme.designer'].sudo().search([
                ('status', '=', 'approved'),
            ], order='total_revenue desc', limit=limit)

            designers_data = []
            for designer in designers:
                designers_data.append({
                    'id': designer.id,
                    'display_name': designer.display_name,
                    'email': designer.email,
                    'themes_count': designer.themes_count,
                    'total_sales': designer.total_sales,
                    'total_revenue': designer.total_revenue,
                    'average_rating': designer.average_rating,
                    'pending_balance': designer.pending_balance,
                    'stripe_payouts_enabled': designer.stripe_payouts_enabled,
                })

            return {
                'success': True,
                'designers': designers_data,
                'total': len(designers_data)
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching top designers: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/analytics/sales-timeline', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_sales_timeline(self, months=6):
        """
        Évolution ventes par mois (ADMIN UNIQUEMENT)

        Args:
            months (int): Nombre de mois à afficher (default: 6)

        Returns:
            dict: {
                success: bool,
                timeline: [{
                    month: str (YYYY-MM),
                    sales_count: int,
                    revenue: float,
                    avg_price: float
                }]
            }
        """
        try:
            self._require_admin()

            # Calculer date début
            end_date = datetime.now()
            start_date = end_date - timedelta(days=months * 30)

            # Récupérer tous les achats complétés
            purchases = request.env['quelyos.theme.purchase'].sudo().search([
                ('status', '=', 'completed'),
                ('create_date', '>=', start_date),
                ('create_date', '<=', end_date),
            ], order='create_date asc')

            # Grouper par mois
            timeline = {}
            for purchase in purchases:
                month_key = purchase.create_date.strftime('%Y-%m')
                if month_key not in timeline:
                    timeline[month_key] = {
                        'month': month_key,
                        'sales_count': 0,
                        'revenue': 0,
                    }
                timeline[month_key]['sales_count'] += 1
                timeline[month_key]['revenue'] += purchase.amount

            # Calculer prix moyen
            for month_data in timeline.values():
                month_data['avg_price'] = month_data['revenue'] / month_data['sales_count'] if month_data['sales_count'] > 0 else 0

            # Convertir en liste triée
            timeline_list = sorted(timeline.values(), key=lambda x: x['month'])

            return {
                'success': True,
                'timeline': timeline_list,
                'total_months': len(timeline_list)
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching sales timeline: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/analytics/category-stats', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_category_stats(self):
        """
        Statistiques par catégorie (ADMIN UNIQUEMENT)

        Returns:
            dict: {
                success: bool,
                categories: [{
                    category: str,
                    themes_count: int,
                    sales_count: int,
                    total_revenue: float,
                    avg_rating: float
                }]
            }
        """
        try:
            self._require_admin()

            # Grouper soumissions par catégorie
            categories = {}
            submissions = request.env['quelyos.theme.submission'].sudo().search([
                ('status', '=', 'approved'),
            ])

            for submission in submissions:
                category = submission.category
                if category not in categories:
                    categories[category] = {
                        'category': category,
                        'themes_count': 0,
                        'sales_count': 0,
                        'total_revenue': 0,
                        'ratings': [],
                    }
                categories[category]['themes_count'] += 1
                categories[category]['sales_count'] += submission.sales_count
                categories[category]['total_revenue'] += submission.total_revenue
                if submission.average_rating > 0:
                    categories[category]['ratings'].append(submission.average_rating)

            # Calculer moyenne ratings
            categories_list = []
            for cat_data in categories.values():
                avg_rating = sum(cat_data['ratings']) / len(cat_data['ratings']) if cat_data['ratings'] else 0
                categories_list.append({
                    'category': cat_data['category'],
                    'themes_count': cat_data['themes_count'],
                    'sales_count': cat_data['sales_count'],
                    'total_revenue': cat_data['total_revenue'],
                    'avg_rating': round(avg_rating, 2),
                })

            # Trier par revenus décroissants
            categories_list.sort(key=lambda x: x['total_revenue'], reverse=True)

            return {
                'success': True,
                'categories': categories_list,
                'total': len(categories_list)
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching category stats: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/analytics/pending-tasks', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_pending_tasks(self):
        """
        Tâches en attente pour admins (ADMIN UNIQUEMENT)

        Returns:
            dict: {
                success: bool,
                tasks: {
                    pending_submissions: [{id, name, designer, submit_date}],
                    pending_payouts: [{designer_id, name, pending_balance}],
                    designers_without_onboarding: [{id, name, themes_count}]
                }
            }
        """
        try:
            self._require_admin()

            # Soumissions en attente validation
            pending_submissions = request.env['quelyos.theme.submission'].sudo().search([
                ('status', 'in', ['submitted', 'in_review'])
            ], order='submit_date asc', limit=10)

            submissions_data = []
            for submission in pending_submissions:
                submissions_data.append({
                    'id': submission.id,
                    'name': submission.name,
                    'designer': submission.designer_id.display_name if submission.designer_id else 'Unknown',
                    'submit_date': submission.submit_date.isoformat() if submission.submit_date else None,
                    'status': submission.status,
                })

            # Designers avec payouts en attente (>= 50 EUR)
            designers_with_pending = request.env['quelyos.theme.designer'].sudo().search([
                ('pending_balance', '>=', 50),
                ('stripe_payouts_enabled', '=', True),
            ], order='pending_balance desc', limit=10)

            payouts_data = []
            for designer in designers_with_pending:
                payouts_data.append({
                    'designer_id': designer.id,
                    'name': designer.display_name,
                    'pending_balance': designer.pending_balance,
                    'last_payout_date': designer.last_payout_date.isoformat() if designer.last_payout_date else None,
                })

            # Designers sans onboarding Stripe complet
            designers_without_onboarding = request.env['quelyos.theme.designer'].sudo().search([
                ('status', '=', 'approved'),
                ('stripe_onboarding_completed', '=', False),
                ('themes_count', '>', 0),
            ], limit=10)

            onboarding_data = []
            for designer in designers_without_onboarding:
                onboarding_data.append({
                    'id': designer.id,
                    'name': designer.display_name,
                    'themes_count': designer.themes_count,
                    'total_sales': designer.total_sales,
                    'pending_balance': designer.pending_balance,
                })

            return {
                'success': True,
                'tasks': {
                    'pending_submissions': submissions_data,
                    'pending_payouts': payouts_data,
                    'designers_without_onboarding': onboarding_data,
                }
            }

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Error fetching pending tasks: {str(e)}")
            return {'success': False, 'error': 'Internal error'}
