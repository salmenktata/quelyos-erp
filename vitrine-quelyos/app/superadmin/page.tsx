'use client';

import Link from 'next/link';

// Icônes inline
const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BarChart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Database = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const modules = [
  {
    title: 'Suivi Sitemap',
    description: 'Gérer et analyser le sitemap du site vitrine',
    href: '/superadmin/sitemap',
    icon: Globe,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    title: 'Utilisateurs',
    description: 'Gestion des comptes et permissions',
    href: '/superadmin/users',
    icon: Users,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-500/25',
    disabled: true,
  },
  {
    title: 'Analytics',
    description: 'Statistiques et métriques du site',
    href: '/superadmin/analytics',
    icon: BarChart,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/25',
    disabled: true,
  },
  {
    title: 'Configuration',
    description: 'Paramètres globaux du système',
    href: '/superadmin/settings',
    icon: Settings,
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    shadowColor: 'shadow-orange-500/25',
    disabled: true,
  },
  {
    title: 'Base de données',
    description: 'Monitoring et maintenance DB',
    href: '/superadmin/database',
    icon: Database,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/25',
    disabled: true,
  },
  {
    title: 'Contenu',
    description: 'Gestion des pages et articles',
    href: '/superadmin/content',
    icon: FileText,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/25',
    disabled: true,
  },
];

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin</h1>
              <p className="text-sm text-slate-400">Gestion et administration Quelyos Vitrine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-bold text-white">Tableau de bord</h2>
          <p className="text-slate-400">
            Bienvenue dans l&apos;espace d&apos;administration. Sélectionnez un module ci-dessous.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const isDisabled = module.disabled;

            if (isDisabled) {
              return (
                <div
                  key={module.title}
                  className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-6 opacity-50"
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg bg-gradient-to-br ${module.gradient} p-3 opacity-50`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-slate-400">{module.title}</h3>
                      <p className="text-sm text-slate-500">{module.description}</p>
                      <p className="mt-3 text-xs text-slate-600">Bientôt disponible</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg bg-gradient-to-br ${module.gradient} p-3 shadow-lg ${module.shadowColor} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-violet-400">
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-400">{module.description}</p>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/0 to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-10" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
