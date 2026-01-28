import { ReactNode } from "react";
import { ModuleSettingsLayout } from "@/components/common/ModuleSettingsLayout";

const navItems = [
  { href: "/store/settings/brand", label: "Marque & Identité" },
  { href: "/store/settings/contact", label: "Contact & Support" },
  { href: "/store/settings/shipping", label: "Livraison" },
  { href: "/store/settings/features", label: "Fonctionnalités" },
  { href: "/store/settings/returns", label: "Retours & Garantie" },
  { href: "/store/settings/social", label: "Réseaux sociaux" },
  { href: "/store/settings/seo", label: "SEO" },
];

export default function StoreSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleSettingsLayout
      moduleId="store"
      navItems={navItems}
      title="Centre de configuration"
      subtitle="Naviguez par rubrique : marque, contact, livraison, fonctionnalités et intégrations."
    >
      {children}
    </ModuleSettingsLayout>
  );
}
