import { ModularLayout } from "@/components/ModularLayout";
import { PageHeader } from "@/components/finance/PageHeader";
import { BellAlertIcon } from "@heroicons/react/24/outline";

export default function AlertsPage() {
  return (
    <ModularLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          icon={BellAlertIcon}
          title="Alertes"
          description="Configurez et gérez vos alertes financières"
          breadcrumbs={[
            { label: "Finance", href: "/finance" },
            { label: "Alertes" },
          ]}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
            <BellAlertIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Page en cours de développement
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            La gestion des alertes sera bientôt disponible.
          </p>
        </div>
      </div>
    </ModularLayout>
  );
}
