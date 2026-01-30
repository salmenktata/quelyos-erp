import { memo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/lib/finance/compat/animated";
import type { DashboardInsight } from "@/lib/finance/reporting";

interface InsightsSectionProps {
  insights: DashboardInsight[];
}

function getInsightIcon(type: DashboardInsight["type"]) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
    case "error":
      return <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />;
    case "info":
    default:
      return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
  }
}

function getInsightStyles(type: DashboardInsight["type"]) {
  switch (type) {
    case "success":
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30";
    case "warning":
      return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30";
    case "error":
      return "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30";
    case "info":
    default:
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30";
  }
}

export const InsightsSection = memo(function InsightsSection({
  insights,
}: InsightsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Ce qu&apos;on a remarqué
        </h2>
      </div>
      {insights.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun insight disponible pour le moment.
          </p>
        </div>
      ) : (
        <StaggerContainer speed="fast" className="space-y-3">
          {insights.map((insight, index) => (
            <StaggerItem key={`${insight.title}-${index}`}>
              <Link
                to={insight.actionUrl}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-all duration-150 hover:scale-[1.01] ${getInsightStyles(insight.type)}`}
              >
                <div className="rounded-lg bg-white dark:bg-gray-700 p-2 shadow-sm">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <p className="mb-1 font-medium text-gray-900 dark:text-white">{insight.title}</p>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300">
                    {insight.action} →
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
});
