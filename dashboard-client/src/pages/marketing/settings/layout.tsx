import { ReactNode } from "react";
import { ModuleSettingsLayout } from "@/components/common/ModuleSettingsLayout";

const navItems = [
  { href: "/marketing/settings/email", label: "Email" },
  { href: "/marketing/settings/sms", label: "SMS" },
];

export default function MarketingSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleSettingsLayout
      moduleId="marketing"
      navItems={navItems}
      title="Paramètres Marketing"
      subtitle="Configuration des canaux email et SMS pour vos campagnes."
    >
      {children}
    </ModuleSettingsLayout>
  );
}
