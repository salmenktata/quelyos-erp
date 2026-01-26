import { memo, useState, useEffect } from "react";
import { DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
  ScaleIn,
} from "@/lib/finance/compat/animated";

interface HeroKPIsProps {
  currentBalance: number;
  yesterdayDelta: number;
  monthEvolution: number;
  formatAmount: (amount: number) => string;
}

export const HeroKPIs = memo(function HeroKPIs({
  currentBalance,
  yesterdayDelta,
  monthEvolution,
  formatAmount,
}: HeroKPIsProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg py-2"
          : "py-0"
      }`}
    >
      <StaggerContainer
        speed="fast"
        className={`grid gap-4 md:grid-cols-2 transition-all duration-300 ${
          isSticky ? "scale-95" : "scale-100"
        }`}
        data-guide="kpi-cards"
      >
        {/* Trésorerie Aujourd'hui */}
        <StaggerItem>
          <ScaleIn>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-indigo-100">
                    Trésorerie aujourd&apos;hui
                  </p>
                  <p className="mb-2 text-4xl font-bold text-white">
                    {formatAmount(currentBalance)}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                    <span className="text-emerald-300">
                      +{formatAmount(yesterdayDelta)} vs hier
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </ScaleIn>
        </StaggerItem>

        {/* Évolution Ce Mois */}
        <StaggerItem>
          <ScaleIn>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-emerald-100">
                    Évolution ce mois
                  </p>
                  <p className="mb-2 text-4xl font-bold text-white">
                    +{monthEvolution}%
                  </p>
                  <p className="text-sm text-emerald-100">
                    Performance solide vs mois dernier
                  </p>
                </div>
                <div className="rounded-xl bg-white/20 p-3">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </ScaleIn>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
});
