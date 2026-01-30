import { memo } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Wallet, Target, Upload, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/finance/compat/routes";
import {
  StaggerContainer,
  StaggerItem,
  Hoverable,
} from "@/lib/finance/compat/animated";

export const QuickActions = memo(function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6" data-guide="quick-actions">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Actions rapides
      </h2>
      <StaggerContainer speed="fast" className="space-y-3">
        <StaggerItem>
          <Hoverable enableScale>
            <Link
              to={ROUTES.TRANSACTIONS}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Nouvelle transaction</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ajouter revenu ou dépense
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
            </Link>
          </Hoverable>
        </StaggerItem>

        <StaggerItem>
          <Hoverable enableScale>
            <Link
              to={ROUTES.REPORTING}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Voir rapports</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">8 rapports spécialisés</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
            </Link>
          </Hoverable>
        </StaggerItem>

        <StaggerItem>
          <Hoverable enableScale>
            <Link
              to={ROUTES.ACCOUNTS}
              data-guide="accounts-section"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                <Wallet className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Gérer comptes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comptes & portefeuilles
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
            </Link>
          </Hoverable>
        </StaggerItem>

        <StaggerItem>
          <Hoverable enableScale>
            <Link
              to={ROUTES.BUDGETS}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Créer budget</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cadres intelligents</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
            </Link>
          </Hoverable>
        </StaggerItem>

        <StaggerItem>
          <Hoverable enableScale>
            <Link
              to={ROUTES.IMPORT}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4 transition-all duration-200 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
                <Upload className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Import intelligent</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Excel/CSV avec détection auto
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
            </Link>
          </Hoverable>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
});
