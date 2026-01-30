import { memo, useState } from "react";
import { Target, CheckCircle2, Zap, Clock, MoreHorizontal } from "lucide-react";
import AlertWidget from "@/components/finance/alerts/AlertWidget";
import { StaggerContainer, StaggerItem } from "@/lib/finance/compat/animated";
import { ActionDialog } from "./ActionDialog";
import type { DashboardAction } from "@/lib/finance/reporting";

interface AlertsRowProps {
  actions: DashboardAction[];
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays === -1) return "Hier";
  if (diffDays < 0) return `Il y a ${Math.abs(diffDays)} jours`;
  if (diffDays <= 7) return `Dans ${diffDays} jours`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export const AlertsRow = memo(function AlertsRow({ actions }: AlertsRowProps) {
  const [selectedAction, setSelectedAction] = useState<DashboardAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActionClick = (action: DashboardAction) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  return (
    <>
      <StaggerContainer
        speed="fast"
        delay={0.1}
        className="grid gap-4 md:grid-cols-3"
      >
        {/* Alertes Trésorerie */}
        <StaggerItem>
          <AlertWidget />
        </StaggerItem>

        {/* Actions Prioritaires */}
        <StaggerItem>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 h-full">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-500 dark:text-violet-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Actions ({actions.length})
              </h3>
            </div>
            {actions.length === 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune action prioritaire</p>
              </div>
            ) : (
              <StaggerContainer speed="fast" className="space-y-2">
                {actions.slice(0, 3).map((action) => (
                  <StaggerItem key={action.id}>
                    <div
                      className={`group relative flex items-start gap-3 rounded-lg border p-3 transition-all duration-150 ${
                        action.priority === "high"
                          ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                          : action.priority === "medium"
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                          action.priority === "high"
                            ? "bg-rose-500"
                            : action.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDueDate(action.dueDate)}</span>
                          </div>
                          <button
                            onClick={() => handleActionClick(action)}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 transition-all hover:bg-violet-100 dark:hover:bg-violet-900/30 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </StaggerItem>

        {/* Statut Général */}
        <StaggerItem>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 h-full">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Statut</h3>
            </div>
            <StaggerContainer speed="fast" className="space-y-3">
              <StaggerItem>
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 transition-colors duration-150 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  <span className="text-sm text-gray-900 dark:text-white">Budgets sains</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 transition-colors duration-150 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  <span className="text-sm text-gray-900 dark:text-white">Prévisions OK</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center justify-between rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-3 transition-colors duration-150 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                  <span className="text-sm text-gray-900 dark:text-white">Runway: 4.2 mois</span>
                  <Zap className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <ActionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        action={selectedAction}
      />
    </>
  );
});
