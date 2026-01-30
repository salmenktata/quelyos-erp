import { memo } from "react";
import { Link } from "react-router-dom";
import { DSOCard } from "@/components/kpis/DSOCard";
import { EBITDACard } from "@/components/kpis/EBITDACard";
import { BFRCard } from "@/components/kpis/BFRCard";
import { BreakEvenCard } from "@/components/kpis/BreakEvenCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/lib/finance/compat/animated";

interface CriticalKPIGridProps {
  days?: number;
}

export const CriticalKPIGrid = memo(function CriticalKPIGrid({
  days = 30,
}: CriticalKPIGridProps) {
  return (
    <div className="bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 rounded-xl shadow-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            KPIs Critiques TPE/PME
          </h2>
          <p className="text-sm text-violet-100">
            Les 4 indicateurs essentiels de pilotage financier
          </p>
        </div>
        <Link
          to="/reporting"
          className="text-sm font-medium text-white/80 hover:text-white"
        >
          Analyses détaillées →
        </Link>
      </div>

      <StaggerContainer
        speed="fast"
        delay={0.1}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StaggerItem>
          <DSOCard days={days} />
        </StaggerItem>

        <StaggerItem>
          <EBITDACard days={days} />
        </StaggerItem>

        <StaggerItem>
          <BFRCard days={days} />
        </StaggerItem>

        <StaggerItem>
          <BreakEvenCard days={days} />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
});
