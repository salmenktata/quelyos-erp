import { ReactNode } from "react";
import { ModuleSettingsLayout } from "@/components/common/ModuleSettingsLayout";

const navItems = [
  { href: "/crm/settings", label: "Vue d'ensemble" },
  { href: "/crm/settings/stages", label: "Étapes pipeline" },
  { href: "/crm/settings/pricelists", label: "Listes de prix" },
  { href: "/crm/settings/categories", label: "Catégories clients" },
  { href: "/crm/settings/scoring", label: "Scoring leads" },
];

export default function CrmSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleSettingsLayout
      moduleId="crm"
      navItems={navItems}
      title="Centre de configuration"
      subtitle="Configurez le pipeline, les listes de prix et la segmentation de vos clients."
    >
      {children}
    </ModuleSettingsLayout>
  );
}
