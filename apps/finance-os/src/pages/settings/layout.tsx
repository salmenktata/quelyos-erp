import { Link, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/settings", label: "Vue d'ensemble" },
  { href: "/settings/devise", label: "Devise & formats" },
  { href: "/settings/tva", label: "TVA & fiscalité" },
  { href: "/settings/categories", label: "Catégories" },
  { href: "/settings/flux", label: "Flux de paiement" },
  { href: "/settings/billing", label: "Abonnement" },
  { href: "/settings/security", label: "Sécurité" },
  { href: "/settings/notifications", label: "Notifications & exports" },
  { href: "/settings/integrations", label: "Intégrations" },
];

function isActive(href: string, pathname: string) {
  if (href === "/settings" && pathname === "/settings") return true;
  return pathname.startsWith(href) && href !== "/settings";
}

export default function SettingsLayout() {
  const { pathname } = useLocation();

  return (
    <div className="relative space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Paramètres</p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Centre de configuration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Naviguez par rubrique : devises, TVA, catégories, notifications et intégrations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                  "border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700",
                  isActive(item.href, pathname)
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <span>{item.label}</span>
                {isActive(item.href, pathname) && (
                  <span className="text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">Actif</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
