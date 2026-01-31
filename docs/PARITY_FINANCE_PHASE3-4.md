# Phase 3-4 : OCA Addons + Fonctionnalités Premium

**Durée** : 14 semaines (Q2-Q3 2026)
**Parité cible** : 65% → 90%
**Priorité** : P1 (Important)

---

## Phase 3 : Intégration OCA Addons (6 semaines)

### 🚀 12 Modules OCA Gratuits à Intégrer

#### 1. account-financial-reporting (Priorité P0)

**Source** : https://github.com/OCA/account-financial-reporting

**Modules à installer** :
- `account_financial_report` - Rapports financiers avancés
- `mis_builder` - Tableaux de bord MIS
- `partner_statement` - Relevés partenaires

**Fonctionnalités ajoutées** :
- Partner Ledger (Grand livre auxiliaire)
- Aged Receivables Report (Balance âgée créances)
- Trial Balance (Balance générale)
- General Ledger (Grand livre général)
- Open Items Report (Comptes ouverts)

**Impact parité** : +8%

**Installation** :
```bash
cd odoo-backend/addons
git clone https://github.com/OCA/account-financial-reporting.git oca-account-financial-reporting
ln -s oca-account-financial-reporting/account_financial_report .
ln -s oca-account-financial-reporting/mis_builder .
ln -s oca-account-financial-reporting/partner_statement .

# Dans Odoo : Activer mode développeur > Apps > Mettre à jour liste > Installer
```

**Endpoints à exposer** :
```python
# odoo-backend/addons/quelyos_api/controllers/oca_reports_ctrl.py

@http.route('/api/finance/reports/partner-ledger', type='json', auth='public', cors='*', csrf=False)
def get_partner_ledger(self, **params):
    """Grand livre auxiliaire par partenaire"""
    # Utiliser account_financial_report.report_partner_ledger
    pass

@http.route('/api/finance/reports/aged-receivables', type='json', auth='public', cors='*', csrf=False)
def get_aged_receivables(self, **params):
    """Balance âgée des créances (30/60/90 jours)"""
    # Utiliser account_financial_report.report_aged_partner_balance
    pass
```

#### 2. l10n-france (Priorité P0)

**Source** : https://github.com/OCA/l10n-france

**Modules à installer** :
- `l10n_fr_fec` - FEC amélioré
- `l10n_fr_das2` - Déclaration DAS2
- `l10n_fr_intrastat_product` - Déclaration Intrastat

**Fonctionnalités ajoutées** :
- FEC (Fichier des Écritures Comptables) conforme DGFiP
- DAS2 (Déclaration honoraires)
- TVA sur encaissements
- Validation SIREN/SIRET

**Impact parité** : +5%

#### 3. account-payment (Priorité P1)

**Source** : https://github.com/OCA/account-payment

**Modules à installer** :
- `account_payment_term_multi_day` - Échéanciers multi-dates
- `account_payment_return` - Retours de paiement
- `account_payment_order` - Ordres de paiement SEPA

**Fonctionnalités ajoutées** :
- Échéanciers personnalisés (ex: 30% acompte, 70% à 60 jours)
- Gestion rejets de prélèvement
- Génération fichiers SEPA (pain.001, pain.008)

**Impact parité** : +4%

#### 4-12. Autres Modules OCA

| Module OCA | Fonctionnalités | Impact |
|------------|-----------------|--------|
| **account-reconcile** | Règles réconciliation avancées, mass reconcile | +3% |
| **account-invoice-reporting** | Statistiques factures, suivi paiements | +3% |
| **account-financial-tools** | Clôture périodes, renumérotation écritures | +2% |
| **l10n-belgium-intrastat** | Déclarations Intrastat Belgique | +1% |
| **account-closing** | Assistant clôture annuelle | +2% |
| **account-move-template** | Modèles écritures récurrentes | +1% |
| **account-fiscal-year** | Gestion exercices fiscaux décalés | +1% |
| **mis-builder** | Tableaux de bord financiers personnalisables | +2% |
| **account-cost-center** | Centres de coûts analytiques | +1% |

**Total gain Phase 3** : +33%

---

## Phase 4 : Fonctionnalités Premium (8 semaines)

### 🎁 6 Features "Enterprise" Gratuites dans Quelyos

#### 1. Prévisions Trésorerie ML (Facebook Prophet)

**Objectif** : Prédire la trésorerie à 3/6/12 mois avec IA

**Technologie** : Facebook Prophet (Time Series Forecasting)

**Backend** : `odoo-backend/addons/quelyos_api/lib/ml/cashflow_forecast.py`

```python
# -*- coding: utf-8 -*-
"""
Prévisions de Trésorerie avec Machine Learning
Utilise Facebook Prophet pour prédire les flux de trésorerie futurs
"""

import logging
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
from odoo import models, fields, api

_logger = logging.getLogger(__name__)


class CashflowForecastService:
    """Service de prévisions de trésorerie ML"""

    def __init__(self, env):
        self.env = env

    def forecast(self, tenant_id, horizon_months=6):
        """
        Générer des prévisions de trésorerie
        
        Args:
            tenant_id: ID du tenant
            horizon_months: Période de prévision (3, 6 ou 12 mois)
        
        Returns:
            DataFrame avec prévisions (date, predicted_cash, lower_bound, upper_bound)
        """
        try:
            # 1. Récupérer l'historique des flux de trésorerie (12 derniers mois minimum)
            historical_data = self._get_historical_cashflow(tenant_id)
            
            if len(historical_data) < 30:  # Minimum 30 jours de données
                raise ValueError("Pas assez de données historiques (minimum 30 jours)")

            # 2. Préparer les données pour Prophet (format: ds, y)
            df = pd.DataFrame(historical_data)
            df['ds'] = pd.to_datetime(df['date'])
            df['y'] = df['cash_balance']
            
            # 3. Entraîner le modèle Prophet
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                interval_width=0.95,  # Intervalle de confiance 95%
            )
            
            # Ajouter régresseurs (ex: jours ouvrés, saison)
            # model.add_regressor('is_working_day')
            
            model.fit(df)

            # 4. Générer prévisions futures
            future_days = horizon_months * 30
            future = model.make_future_dataframe(periods=future_days, freq='D')
            forecast = model.predict(future)

            # 5. Filtrer seulement les prévisions futures
            forecast_future = forecast[forecast['ds'] > df['ds'].max()]

            # 6. Formater résultat
            result = {
                'predictions': [
                    {
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'predictedCash': float(row['yhat']),
                        'lowerBound': float(row['yhat_lower']),
                        'upperBound': float(row['yhat_upper']),
                    }
                    for _, row in forecast_future.iterrows()
                ],
                'accuracy': self._calculate_accuracy(df, forecast),
                'trend': 'up' if forecast_future['yhat'].iloc[-1] > df['y'].iloc[-1] else 'down',
            }

            _logger.info(f"Prévisions trésorerie générées : {len(result['predictions'])} jours")
            return result

        except Exception as e:
            _logger.error(f"Erreur forecast: {e}", exc_info=True)
            raise

    def _get_historical_cashflow(self, tenant_id, days=365):
        """Récupérer l'historique des soldes bancaires"""
        # Requête SQL pour performances optimales
        query = """
            SELECT 
                date::date as date,
                SUM(amount) OVER (ORDER BY date::date) as cash_balance
            FROM account_bank_statement_line
            WHERE tenant_id = %s
                AND date >= NOW() - INTERVAL '%s days'
            GROUP BY date::date
            ORDER BY date::date
        """
        
        self.env.cr.execute(query, (tenant_id, days))
        rows = self.env.cr.fetchall()
        
        return [{'date': row[0], 'cash_balance': row[1]} for row in rows]

    def _calculate_accuracy(self, historical_df, forecast_df):
        """Calculer la précision du modèle (MAPE)"""
        # Mean Absolute Percentage Error
        # Comparer les prédictions passées avec les vraies valeurs
        
        # Filtrer forecast pour dates historiques
        historical_forecast = forecast_df[forecast_df['ds'].isin(historical_df['ds'])]
        
        if len(historical_forecast) == 0:
            return None
        
        # Fusionner
        merged = historical_df.merge(historical_forecast[['ds', 'yhat']], on='ds')
        
        # MAPE
        mape = (abs(merged['y'] - merged['yhat']) / merged['y']).mean() * 100
        
        return {
            'mape': float(mape),
            'accuracy': float(100 - mape),
        }
```

**Endpoint API** :

```python
# odoo-backend/addons/quelyos_api/controllers/cashflow_forecast_ctrl.py

from odoo import http
from odoo.http import request
from .base import BaseController
from ..lib.ml.cashflow_forecast import CashflowForecastService

class CashflowForecastController(BaseController):

    @http.route('/api/finance/cashflow-forecast', type='json', auth='public', methods=['POST', 'OPTIONS'], cors='*', csrf=False)
    def get_cashflow_forecast(self, **params):
        """
        Prévisions de trésorerie ML
        
        Body:
        {
          "horizonMonths": 6
        }
        """
        try:
            user = self._authenticate_from_header()
            if not user:
                return self._error_response("Session expirée", "UNAUTHORIZED", 401)

            tenant_id = self._get_tenant_id(user)

            # Paramètres
            horizon_months = params.get('horizonMonths', 6)

            # Générer prévisions
            service = CashflowForecastService(request.env)
            forecast = service.forecast(tenant_id, horizon_months)

            return self._success_response(forecast)

        except Exception as e:
            return self._error_response(str(e), "SERVER_ERROR", 500)
```

**Page UI** : `dashboard-client/src/pages/finance/cashflow-forecast/page.tsx`

```typescript
/**
 * Page Prévisions de Trésorerie ML
 */

import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/common'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCashflowForecast } from '@/hooks/useCashflowForecast'
import { Line } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/utils'

export default function CashflowForecastPage() {
  const [horizon, setHorizon] = useState(6)
  const { forecast, loading, generate } = useCashflowForecast()

  const chartData = {
    labels: forecast?.predictions.map(p => p.date) || [],
    datasets: [
      {
        label: 'Prévision',
        data: forecast?.predictions.map(p => p.predictedCash) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
      {
        label: 'Limite haute (95%)',
        data: forecast?.predictions.map(p => p.upperBound) || [],
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Limite basse (95%)',
        data: forecast?.predictions.map(p => p.lowerBound) || [],
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Prévisions de Trésorerie (IA)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Prédictions basées sur l&apos;historique avec Machine Learning
        </p>
      </div>

      {/* Horizon */}
      <div className="mb-6 flex gap-4 items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizon :</span>
        {[3, 6, 12].map(months => (
          <button
            key={months}
            onClick={() => setHorizon(months)}
            className={`px-4 py-2 rounded-lg ${
              horizon === months
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {months} mois
          </button>
        ))}
        
        <Button variant="primary" onClick={() => generate(horizon)} disabled={loading}>
          {loading ? 'Calcul en cours...' : 'Générer Prévisions'}
        </Button>
      </div>

      {/* Métriques */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tendance</p>
            <div className="flex items-center gap-2 mt-1">
              {forecast.trend === 'up' ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {forecast.trend === 'up' ? 'Positive' : 'Négative'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Précision Modèle</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {forecast.accuracy?.accuracy.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trésorerie dans {horizon} mois
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(forecast.predictions[forecast.predictions.length - 1]?.predictedCash || 0, '€')}
            </p>
          </div>
        </div>
      )}

      {/* Graphique */}
      {forecast && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      )}
    </Layout>
  )
}
```

**Dépendances** :
```bash
# Backend
pip install prophet pandas

# Frontend
pnpm add chart.js react-chartjs-2
```

---

#### 2. Open Banking DSP2/PSD2

**Objectif** : Connexion automatique comptes bancaires (Budget Insight, Tink)

**Endpoints** :
- `POST /api/finance/open-banking/connect` - Initier connexion bancaire
- `GET /api/finance/open-banking/accounts` - Liste comptes synchronisés
- `POST /api/finance/open-banking/sync` - Synchroniser transactions

**Providers** :
- Budget Insight (France/Europe) - https://www.budget-insight.com/
- Tink (Europe) - https://tink.com/
- Plaid (US) - https://plaid.com/

---

#### 3. Rapprochement Bancaire AI

**Objectif** : Matching automatique lignes bancaires <> écritures comptables avec score ML

**Algorithme** :
1. **Règles exactes** (score 100) : Montant + Date + Référence identiques
2. **Similarité** (score 70-90) : Levenshtein distance sur libellés
3. **Machine Learning** (score 50-70) : TF-IDF + Cosine Similarity

**Endpoint** :
```python
@http.route('/api/finance/bank-reconciliation/suggest', type='json', auth='public', cors='*', csrf=False)
def suggest_reconciliation(self, **params):
    """
    Suggérer réconciliations avec score ML
    
    Returns:
    {
      "suggestions": [
        {
          "bankLineId": 123,
          "moveLineId": 456,
          "score": 85,
          "reason": "Similarité libellé (85%) + montant exact"
        }
      ]
    }
    """
    pass
```

---

#### 4. Dashboards CFO Executive

**Objectif** : KPIs financiers en temps réel (DSO, DPO, Working Capital)

**Métriques** :
- DSO (Days Sales Outstanding) - Délai moyen recouvrement clients
- DPO (Days Payable Outstanding) - Délai moyen paiement fournisseurs
- Working Capital - Besoin en fonds de roulement
- Cash Conversion Cycle - Cycle de conversion trésorerie
- Burn Rate - Taux de consommation trésorerie

**Page** : `dashboard-client/src/pages/finance/cfo-dashboard/page.tsx`

---

#### 5. SEPA Direct Debit (Prélèvement)

**Objectif** : Générer fichiers pain.008 XML pour prélèvements SEPA

**Endpoint** :
```python
@http.route('/api/finance/sepa/direct-debit/generate', type='http', auth='public', cors='*', csrf=False)
def generate_sepa_direct_debit(self, **params):
    """
    Générer fichier SEPA pain.008.001.02 (Direct Debit)
    
    Body:
    {
      "invoiceIds": [1, 2, 3],
      "executionDate": "2026-02-15"
    }
    """
    # Générer XML conforme ISO 20022 pain.008
    pass
```

**Format** : ISO 20022 pain.008.001.02 (Customer Direct Debit Initiation)

---

#### 6. Consolidation Multi-Sociétés

**Objectif** : Rapports consolidés pour groupe de sociétés

**Fonctionnalités** :
- Éliminations inter-sociétés automatiques
- Conversion devises multiples
- Bilan et P&L consolidés
- Reporting par filiale

**Modèle** : `quelyos.consolidation.group`

---

## 🎯 Résumé Phase 3-4

### KPIs de Succès

| Métrique | Objectif Phase 3 | Objectif Phase 4 |
|----------|------------------|------------------|
| Parité fonctionnelle | 80% | 90% |
| Modules OCA installés | 12 | 12 |
| Endpoints API Premium | - | 20 |
| Pages UI Premium | - | 6 |
| Précision ML Forecast | - | 85%+ |
| Comptes bancaires DSP2 | - | 5+ |

### Différenciation vs Odoo Enterprise

| Feature | Odoo Enterprise | Quelyos Finance |
|---------|-----------------|-----------------|
| **Prévisions Trésorerie ML** | ❌ Non disponible | ✅ Prophet (gratuit) |
| **Open Banking DSP2** | ❌ Non disponible | ✅ Inclus (gratuit) |
| **Rapprochement AI** | ⚠️ Basique | ✅ ML Scoring (gratuit) |
| **Modules OCA** | ❌ Non inclus | ✅ 12 modules (gratuit) |
| **SEPA Direct Debit** | ✅ Payant | ✅ Gratuit |
| **Consolidation** | ✅ Payant | ✅ Gratuit |

**Économie client** : $55/user/mois → $6,600/an (10 users)

---

## 📚 Ressources

### OCA Repositories
- https://github.com/OCA/account-financial-reporting
- https://github.com/OCA/l10n-france
- https://github.com/OCA/account-payment
- https://github.com/OCA/account-reconcile

### Documentation Technique
- Facebook Prophet : https://facebook.github.io/prophet/
- DSP2/PSD2 : https://www.ecb.europa.eu/paym/intro/mip-online/2018/html/1803_revisedpsd.en.html
- ISO 20022 : https://www.iso20022.org/
- EDI-TVA : https://www.impots.gouv.fr/portail/professionnel/edi-tva-tdfc

---

**Auteur** : Claude Code - Audit Parité Fonctionnelle
**Date** : 2026-01-31
**Version** : 1.0
