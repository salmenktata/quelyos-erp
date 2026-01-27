import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, FileText, GitCompare, Info } from "lucide-react";
import PaymentScheduleCalendar from "./PaymentScheduleCalendar";
import OptimizationPanel from "./OptimizationPanel";
import ScenariosPanel from "./ScenariosPanel";
import ScenarioComparison from "./ScenarioComparison";

export default function PaymentPlanningPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Planification des paiements</h1>
        <p className="text-muted-foreground">
          Optimisez vos paiements fournisseurs et gérez votre trésorerie efficacement
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex gap-3 pt-6">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Outil de gestion de trésorerie</p>
            <p className="text-blue-700">
              Visualisez vos échéances, optimisez vos paiements selon vos contraintes de trésorerie,
              créez des scénarios de paiement et comparez les différentes stratégies.
            </p>
          </div>
        </CardContent>
      </Card>

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
  );
}
