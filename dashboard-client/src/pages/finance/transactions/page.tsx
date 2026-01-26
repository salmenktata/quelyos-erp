import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/finance/compat/routes";

export default function TransactionsPage() {
  // Redirige vers la page des dépenses par défaut
  return <Navigate to={ROUTES.FINANCE.DASHBOARD.EXPENSES.HOME} replace />;
}
