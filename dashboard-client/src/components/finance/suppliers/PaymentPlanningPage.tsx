/**
 * Page : Planification des paiements fournisseurs
 *
 * Fonctionnalités :
 * - Calendrier visuel des échéances de paiement sur 60 jours avec code couleur
 * - Optimisation automatique selon 5 stratégies (date, importance, pénalités, remises, trésorerie)
 * - Création et sauvegarde de scénarios de paiement personnalisés
 * - Comparaison détaillée de scénarios avec métriques (économies, taux à temps, pénalités)
 * - Export Excel des plans de paiement optimisés
 * - Exécution directe des paiements validés depuis l'interface
 */

import { Layout } from '@/components/Layout';
import { Breadcrumbs, PageNotice } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sparkles, FileText, GitCompare } from "lucide-react";
import PaymentScheduleCalendar from "./PaymentScheduleCalendar";
import OptimizationPanel from "./OptimizationPanel";
import ScenariosPanel from "./ScenariosPanel";
import ScenarioComparison from "./ScenarioComparison";
import { financeNotices } from '@/lib/notices/finance-notices';

export default function PaymentPlanningPage() {
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Finance', href: '/finance' },
              { label: 'Fournisseurs', href: '/finance/suppliers' },
              { label: 'Planification des paiements', href: '/finance/payment-planning' }
            ]}
          />

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:!text-white">Planification des paiements</h1>
            <p className="text-muted-foreground">
              Optimisez vos paiements fournisseurs et gérez votre trésorerie efficacement
            </p>
          </div>

          <PageNotice
            config={financeNotices['payment-planning']}
            className="mb-6"
          />

          {/* Tabs */}
          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 h-auto">
              <TabsTrigger value="calendar" className="flex items-center gap-2 py-3">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendrier</span>
              </TabsTrigger>
              <TabsTrigger value="optimize" className="flex items-center gap-2 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Optimisation</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-2 py-3">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Scénarios</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2 py-3">
                <GitCompare className="h-4 w-4" />
                <span className="hidden sm:inline">Comparaison</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4 mt-6">
              <PaymentScheduleCalendar />
            </TabsContent>

            <TabsContent value="optimize" className="space-y-4 mt-6">
              <OptimizationPanel />
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4 mt-6">
              <ScenariosPanel />
            </TabsContent>

            <TabsContent value="compare" className="space-y-4 mt-6">
              <ScenarioComparison />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
