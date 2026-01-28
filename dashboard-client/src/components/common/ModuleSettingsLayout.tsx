import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ModuleId } from "@/config/modules";

// Couleurs et gradients par module
const MODULE_SETTINGS_THEME = {
  finance: {
    primary: "emerald",
    text: "text-emerald-100/80",
    activeText: "text-emerald-100",
    badge: "bg-emerald-500/20",
    gradients: [
      { color: "bg-indigo-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-purple-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-emerald-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  store: {
    primary: "indigo",
    text: "text-indigo-100/80",
    activeText: "text-indigo-100",
    badge: "bg-indigo-500/20",
    gradients: [
      { color: "bg-indigo-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-blue-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-cyan-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  stock: {
    primary: "orange",
    text: "text-orange-100/80",
    activeText: "text-orange-100",
    badge: "bg-orange-500/20",
    gradients: [
      { color: "bg-orange-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-amber-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-yellow-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  crm: {
    primary: "violet",
    text: "text-violet-100/80",
    activeText: "text-violet-100",
    badge: "bg-violet-500/20",
    gradients: [
      { color: "bg-violet-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-purple-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-fuchsia-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  marketing: {
    primary: "pink",
    text: "text-pink-100/80",
    activeText: "text-pink-100",
    badge: "bg-pink-500/20",
    gradients: [
      { color: "bg-pink-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-rose-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-fuchsia-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  hr: {
    primary: "cyan",
    text: "text-cyan-100/80",
    activeText: "text-cyan-100",
    badge: "bg-cyan-500/20",
    gradients: [
      { color: "bg-cyan-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-teal-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-sky-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
  home: {
    primary: "gray",
    text: "text-gray-100/80",
    activeText: "text-gray-100",
    badge: "bg-gray-500/20",
    gradients: [
      { color: "bg-gray-500/20", position: "-left-40 top-0", size: "h-[500px] w-[500px]" },
      { color: "bg-slate-500/20", position: "-right-40 top-1/3", size: "h-[400px] w-[400px]" },
      { color: "bg-zinc-500/20", position: "bottom-0 left-1/3", size: "h-[350px] w-[350px]" },
    ],
  },
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export interface ModuleSettingsLayoutProps {
  moduleId: ModuleId;
  navItems: NavItem[];
  title: string;
  subtitle: string;
  children: ReactNode;
}

function isActive(href: string, pathname: string, basePath: string) {
  if (href === basePath && pathname === basePath) return true;
  return pathname.startsWith(href) && href !== basePath;
}

export function ModuleSettingsLayout({
  moduleId,
  navItems,
  title,
  subtitle,
  children,
}: ModuleSettingsLayoutProps) {
  const { pathname } = useLocation();
  const theme = MODULE_SETTINGS_THEME[moduleId];
  const basePath = navItems[0]?.href || "";

  return (
    <div className="relative space-y-6 text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {theme.gradients.map((gradient, index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-full blur-[120px]",
              gradient.color,
              gradient.position,
              gradient.size
            )}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className={cn("text-xs uppercase tracking-[0.25em]", theme.text)}>
          Paramètres
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={cn("text-sm", theme.text)}>{subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-lg">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                  "border border-transparent hover:border-white/15 hover:bg-white/5",
                  isActive(item.href, pathname, basePath)
                    ? "border-white/25 bg-white/10 text-white"
                    : theme.text
                )}
              >
                <span>{item.label}</span>
                {isActive(item.href, pathname, basePath) && (
                  <span className={cn("text-xs rounded-full px-2 py-0.5", theme.badge, theme.activeText)}>
                    Actif
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export default ModuleSettingsLayout;
