import { useState } from "react";
import { motion } from "framer-motion";
import { ModularLayout } from "@/components/ModularLayout";
import { TrendingUp, TrendingDown, Target, Sparkles, BarChart3 } from "lucide-react";
import { useRequireAuth } from "@/lib/finance/compat/auth";
import { useCurrency } from "@/lib/finance/CurrencyContext";
import { useForecast } from "@/hooks/finance/useForecast";
import { GlassCard, GlassStatCard, GlassPanel } from "@/components/ui/glass";
import { EventMarkers } from "@/components/finance/forecast/EventMarkers";
import { OptimizedForecastChart } from "@/components/finance/forecast/OptimizedForecastChart";
import WhatIfSimulator from "@/components/finance/forecast/WhatIfSimulator";
import { AccuracyMetrics } from "@/components/finance/forecast/AccuracyMetrics";
import { ForecastHeader } from "@/components/finance/forecast/ForecastHeader";
import { HorizonSelector } from "@/components/finance/forecast/HorizonSelector";
import { RiskIndicatorCard } from "@/components/finance/forecast/RiskIndicatorCard";
import { AccountBreakdown } from "@/components/finance/forecast/AccountBreakdown";

export default function ForecastPage() {
  useRequireAuth();
  const { currency } = useCurrency();
  const [showConfidence, setShowConfidence] = useState(true);
  const [showScenarios, setShowScenarios] = useState(true);

  const {
    forecast,
    loading,
    error,
    selectedDays,
    setSelectedDays,
    confidenceZones,
    riskIndicator,
    handleSimulate,
    handleResetSimulation,
    handleAddEvent,
    handleDeleteEvent,
    handleImportEvents,
  } = useForecast();

  const cards = forecast
    ? [
        {
          label: "Solde actuel",
          value: forecast.baseBalance,
          icon: BarChart3,
          color: "indigo" as const,
        },
        {
          label: "Impact prévu",
          value: forecast.futureImpact,
          icon: forecast.futureImpact >= 0 ? TrendingUp : TrendingDown,
          color: forecast.futureImpact >= 0 ? ("emerald" as const) : ("rose" as const),
        },
        {
          label: `Projection ${forecast.days}j`,
          value: forecast.projectedBalance,
          icon: Target,
          color: "purple" as const,
        },
      ]
    : [];

  return (
    <ModularLayout>
      <div className="p-4 md:p-8 space-y-8">
        <ForecastHeader
          showConfidence={showConfidence}
          showScenarios={showScenarios}
          onToggleConfidence={() => setShowConfidence(!showConfidence)}
          onToggleScenarios={() => setShowScenarios(!showScenarios)}
          forecast={forecast}
        />

        <HorizonSelector selectedDays={selectedDays} onSelect={setSelectedDays} />

        {forecast?.model && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-100 dark:bg-indigo-500/10 px-4 py-3"
          >
            <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div className="flex-1">
              <p className="text-sm text-indigo-700 dark:text-indigo-200">
                {forecast.model.type === "prophet" ? (
                  <>
                    Modèle Prophet IA entraîné sur <strong>{forecast.model.trainedOn}</strong> jours
                    avec saisonnalité {forecast.model.seasonality?.join(", ") || "auto-détectée"}
                  </>
                ) : (
                  <>Prévision simple basée sur la tendance historique</>
                )}
              </p>
            </div>
            {forecast.model.last_trained && (
              <span className="text-xs text-indigo-500 dark:text-indigo-300/70">
                Entraîné: {new Date(forecast.model.last_trained).toLocaleDateString("fr-FR")}
              </span>
            )}
          </motion.div>
        )}

        {loading && (
          <GlassCard variant="subtle" className="flex items-center justify-center gap-3 p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            <span className="text-sm text-gray-600 dark:text-indigo-100/80">
              Calcul des prévisions en cours...
            </span>
          </GlassCard>
        )}

        {error && (
          <GlassCard className="border-red-300/40 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-100">
            {error}
          </GlassCard>
        )}

        {forecast && (
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassStatCard
                    label={card.label}
                    value={`${card.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ${currency}`}
                    accentColor={card.color}
                    icon={<Icon size={18} />}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {riskIndicator && <RiskIndicatorCard risk={riskIndicator} currency={currency} />}

        {forecast && (
          <WhatIfSimulator
            baseBalance={forecast.baseBalance}
            onSimulate={handleSimulate}
            onReset={handleResetSimulation}
          />
        )}

        {confidenceZones.length > 0 && (
          <GlassPanel gradient="purple" className="p-6" data-guide="forecast-chart">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Évolution sur {selectedDays} jours
                </h2>
                <p className="text-sm text-gray-600 dark:text-indigo-100/80">
                  Graphique interactif avec zone de confiance ML
                </p>
              </div>
            </div>
            <OptimizedForecastChart
              zones={confidenceZones}
              currency={currency}
              showConfidence={showConfidence}
              showScenarios={showScenarios}
            />
          </GlassPanel>
        )}

        {forecast && forecast.events !== undefined && (
          <GlassPanel gradient="emerald" className="p-6">
            <EventMarkers
              events={forecast.events || []}
              onAdd={handleAddEvent}
              onDelete={handleDeleteEvent}
              onImport={handleImportEvents}
            />
          </GlassPanel>
        )}

        {forecast?.model?.type === "prophet" && forecast.model.backtesting_available && (
          <AccuracyMetrics horizonDays={selectedDays} currency={currency} />
        )}

        <AccountBreakdown accounts={forecast?.perAccount ?? []} currency={currency} />
      </div>
    </ModularLayout>
  );
}
