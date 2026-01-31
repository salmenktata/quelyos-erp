import { ReactNode } from "react";
import { ModuleSettingsLayout } from "@/components/common/ModuleSettingsLayout";

const navItems = [
  { href: "/stock/settings", label: "Vue d'ensemble" },
  { href: "/stock/settings/valuation", label: "Valorisation" },
  { href: "/stock/settings/reordering", label: "Réappro. auto" },
  { href: "/stock/settings/units", label: "Unités de mesure" },
  { href: "/stock/settings/alerts", label: "Alertes stock" },
];

export default function StockSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleSettingsLayout
      moduleId="stock"
      navItems={navItems}
      title="Centre de configuration"
      subtitle="Configurez la valorisation, le réapprovisionnement et les alertes de votre inventaire."
    >
      {children}
    </ModuleSettingsLayout>
  );
}
