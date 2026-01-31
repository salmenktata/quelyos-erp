/**
 * Analytics Prédictifs POS
 * Dashboard avancé avec prédictions et insights
 *
 * Fonctionnalités :
 * - Prédictions de ventes par heure basées sur l'IA
 * - Alertes de réapprovisionnement avec sévérité
 * - Tendances produits (hausse, baisse, stable)
 * - Heatmap des ventes par jour/heure
 * - Précision du modèle prédictif en temps réel
 * - Filtrage par période (jour, semaine, mois)
 */

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  Calendar,
} from 'lucide-react'
import { Breadcrumbs, Button, PageNotice } from '../../components/common'
import { posNotices } from '../../lib/notices/pos-notices'

// Types
interface HourlyPrediction {
  hour: number
  predicted: number
  actual?: number
  confidence: number
}

interface ProductTrend {
  id: number
  name: string
  currentSales: number
  predictedSales: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

interface StockAlert {
  productId: number
  productName: string
  currentStock: number
  predictedDemand: number
  daysUntilStockout: number
  severity: 'low' | 'medium' | 'high'
}

// Mock data
const hourlyPredictions: HourlyPrediction[] = [
  { hour: 8, predicted: 12, actual: 14, confidence: 0.85 },
  { hour: 9, predicted: 28, actual: 25, confidence: 0.88 },
  { hour: 10, predicted: 35, actual: 38, confidence: 0.92 },
  { hour: 11, predicted: 45, actual: 42, confidence: 0.90 },
  { hour: 12, predicted: 68, actual: 72, confidence: 0.95 },
  { hour: 13, predicted: 55, actual: 51, confidence: 0.88 },
  { hour: 14, predicted: 32, actual: 30, confidence: 0.85 },
  { hour: 15, predicted: 28, confidence: 0.82 },
  { hour: 16, predicted: 35, confidence: 0.80 },
  { hour: 17, predicted: 48, confidence: 0.78 },
  { hour: 18, predicted: 62, confidence: 0.75 },
  { hour: 19, predicted: 45, confidence: 0.72 },
  { hour: 20, predicted: 25, confidence: 0.70 },
]

const productTrends: ProductTrend[] = [
  { id: 1, name: 'Café Expresso', currentSales: 145, predictedSales: 168, trend: 'up', trendPercent: 15.8 },
  { id: 2, name: 'Croissant', currentSales: 89, predictedSales: 102, trend: 'up', trendPercent: 14.6 },
  { id: 3, name: 'Sandwich Poulet', currentSales: 67, predictedSales: 58, trend: 'down', trendPercent: -13.4 },
  { id: 4, name: 'Salade César', currentSales: 45, predictedSales: 52, trend: 'up', trendPercent: 15.5 },
  { id: 5, name: 'Jus Orange', currentSales: 78, predictedSales: 76, trend: 'stable', trendPercent: -2.5 },
  { id: 6, name: 'Tiramisu', currentSales: 34, predictedSales: 41, trend: 'up', trendPercent: 20.5 },
]

const stockAlerts: StockAlert[] = [
  { productId: 1, productName: 'Croissants', currentStock: 12, predictedDemand: 45, daysUntilStockout: 0.3, severity: 'high' },
  { productId: 2, productName: 'Lait', currentStock: 8, predictedDemand: 25, daysUntilStockout: 0.5, severity: 'high' },
  { productId: 3, productName: 'Café moulu', currentStock: 3, predictedDemand: 5, daysUntilStockout: 1.2, severity: 'medium' },
  { productId: 4, productName: 'Serviettes', currentStock: 150, predictedDemand: 80, daysUntilStockout: 2.5, severity: 'low' },
]

// Heatmap des ventes par jour/heure
const salesHeatmap = [
  [5, 12, 25, 35, 48, 32, 18, 8],   // Lundi
  [6, 15, 28, 38, 52, 35, 20, 10],  // Mardi
  [5, 14, 30, 42, 55, 38, 22, 12],  // Mercredi
  [7, 16, 32, 45, 58, 40, 25, 14],  // Jeudi
  [8, 18, 35, 48, 65, 45, 30, 18],  // Vendredi
  [12, 25, 42, 55, 72, 52, 35, 20], // Samedi
  [10, 20, 35, 45, 55, 40, 28, 15], // Dimanche
]

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const hours = ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h']

export default function POSAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  // Calculs
  const currentHour = new Date().getHours()
  const predictedRemaining = useMemo(() => {
    return hourlyPredictions
      .filter(h => h.hour >= currentHour)
      .reduce((sum, h) => sum + h.predicted, 0)
  }, [currentHour])

  const actualToday = useMemo(() => {
    return hourlyPredictions
      .filter(h => h.actual !== undefined)
      .reduce((sum, h) => sum + (h.actual || 0), 0)
  }, [])

  const accuracy = useMemo(() => {
    const withActual = hourlyPredictions.filter(h => h.actual !== undefined)
    if (withActual.length === 0) return 0
    const totalError = withActual.reduce((sum, h) => {
      return sum + Math.abs((h.actual || 0) - h.predicted) / h.predicted
    }, 0)
    return Math.round((1 - totalError / withActual.length) * 100)
  }, [])

  // Heatmap color
  const getHeatmapColor = (value: number) => {
    const max = 72
    const intensity = value / max
    if (intensity < 0.25) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    if (intensity < 0.5) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    if (intensity < 0.75) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  return (
    
      <div className="p-4 md:p-8 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'POS', href: '/pos' },
            { label: 'Analytics Prédictifs' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-purple-500" />
              Analytics Prédictifs
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Prévisions et tendances basées sur l'IA
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
            <Button variant="primary" icon={<RefreshCw className="h-4 w-4" />} className="bg-purple-600 hover:bg-purple-700">
              Actualiser
            </Button>
          </div>
        </div>

        {/* PageNotice */}
        <PageNotice config={posNotices.analytics} className="mb-6" />

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Ventes réelles</span>
            <ShoppingBag className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{actualToday}</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +12% vs hier
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Prévision restante</span>
            <Target className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{predictedRemaining}</p>
          <p className="text-sm text-gray-500">ventes attendues</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Précision modèle</span>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{accuracy}%</p>
          <p className="text-sm text-green-600">Excellent</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Alertes stock</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stockAlerts.filter(a => a.severity === 'high').length}
          </p>
          <p className="text-sm text-red-600">Critiques</p>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prédictions horaires */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Prédictions par heure
          </h2>

          <div className="space-y-2">
            {hourlyPredictions.map((prediction) => {
              const isPast = prediction.actual !== undefined
              const isNow = prediction.hour === currentHour
              const variance = isPast && prediction.actual
                ? ((prediction.actual - prediction.predicted) / prediction.predicted * 100).toFixed(1)
                : null

              return (
                <div
                  key={prediction.hour}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    isNow
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <span className={`w-12 font-mono font-semibold ${isNow ? 'text-blue-600' : 'text-gray-500'}`}>
                    {prediction.hour}:00
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 bg-purple-500 rounded"
                        style={{ width: `${(prediction.predicted / 75) * 100}%` }}
                      />
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        {prediction.predicted}
                      </span>
                    </div>
                    {isPast && (
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="h-4 bg-green-500 rounded"
                          style={{ width: `${((prediction.actual || 0) / 75) * 100}%` }}
                        />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {prediction.actual}
                        </span>
                        <span className={`text-xs ${
                          parseFloat(variance || '0') >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ({variance}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prediction.confidence >= 0.9
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : prediction.confidence >= 0.8
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {Math.round(prediction.confidence * 100)}% confiance
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertes Réapprovisionnement
          </h2>

          <div className="space-y-3">
            {stockAlerts.map((alert) => (
              <div
                key={alert.productId}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {alert.productName}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    alert.severity === 'high'
                      ? 'bg-red-500 text-white'
                      : alert.severity === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {alert.severity === 'high' ? 'Critique' : alert.severity === 'medium' ? 'Attention' : 'Info'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Stock actuel: <strong>{alert.currentStock}</strong></p>
                  <p>Demande prévue: <strong>{alert.predictedDemand}</strong>/jour</p>
                  <p className={alert.severity === 'high' ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                    Rupture dans: <strong>{alert.daysUntilStockout < 1 ? `${Math.round(alert.daysUntilStockout * 24)}h` : `${alert.daysUntilStockout.toFixed(1)} jours`}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" className="mt-4 w-full">
            Voir toutes les alertes →
          </Button>
        </div>
        </div>

        {/* Heatmap + Tendances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap affluence */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Heatmap Affluence
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm text-gray-500 dark:text-gray-400"></th>
                  {hours.map((h) => (
                    <th key={h} className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesHeatmap.map((row, dayIndex) => (
                  <tr key={days[dayIndex]}>
                    <td className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300">{days[dayIndex]}</td>
                    {row.map((value, hourIndex) => (
                      <td key={hourIndex} className="p-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold ${getHeatmapColor(value)}`}>
                          {value}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30" /> Calme
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30" /> Modéré
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30" /> Chargé
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30" /> Rush
            </span>
          </div>
        </div>

        {/* Tendances produits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Tendances Produits
          </h2>

          <div className="space-y-3">
            {productTrends.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    product.trend === 'up'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : product.trend === 'down'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {product.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : product.trend === 'down' ? (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.currentSales} vendus → {product.predictedSales} prévus
                    </p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${
                  product.trend === 'up' ? 'text-green-600' :
                  product.trend === 'down' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {product.trendPercent > 0 ? '+' : ''}{product.trendPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    
  )
}
