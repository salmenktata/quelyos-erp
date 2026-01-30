'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createComponentLogger } from '@/lib/logger';

const log = createComponentLogger('SuperAdminSitemap');

// Icônes inline
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

interface SitemapEntry {
  url: string;
  path: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
}

interface SitemapStats {
  total: number;
  byPriority: { [key: string]: number };
  byFrequency: { [key: string]: number };
  lastUpdate: string;
}

export default function SuperAdminSitemapPage() {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');

  useEffect(() => {
    fetchSitemap();
  }, []);

  async function fetchSitemap() {
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/sitemap');
      if (!response.ok) throw new Error('Failed to fetch sitemap');

      const data = await response.json();
      setEntries(data.entries);
      setStats(data.stats);
    } catch (error) {
      log.error('Erreur lors du chargement du sitemap:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || entry.priority.toString() === filterPriority;
    const matchesFrequency = filterFrequency === 'all' || entry.changeFrequency === filterFrequency;
    return matchesSearch && matchesPriority && matchesFrequency;
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 0.9) return 'text-green-400 bg-green-500/10';
    if (priority >= 0.7) return 'text-blue-400 bg-blue-500/10';
    if (priority >= 0.5) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case 'daily': return 'text-red-400 bg-red-500/10';
      case 'weekly': return 'text-orange-400 bg-orange-500/10';
      case 'monthly': return 'text-blue-400 bg-blue-500/10';
      case 'yearly': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-violet-400">Chargement du sitemap...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/superadmin"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Suivi Sitemap</h1>
                  <p className="text-xs text-slate-400">Vitrine Quelyos</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchSitemap}
              className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-400 transition-all hover:bg-violet-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-3">
                  <FileText className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total URLs</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Haute priorité</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.byPriority['0.9'] || 0 + stats.byPriority['1'] || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-3">
                  <RefreshCw className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Hebdomadaire</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.byFrequency['weekly'] || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <AlertCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Dernière MAJ</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(stats.lastUpdate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">Toutes priorités</option>
              <option value="1">Priorité 1.0</option>
              <option value="0.9">Priorité 0.9</option>
              <option value="0.8">Priorité 0.8</option>
              <option value="0.7">Priorité 0.7</option>
              <option value="0.6">Priorité 0.6</option>
            </select>

            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">Toutes fréquences</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
              <option value="yearly">Annuelle</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Priorité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Fréquence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dernière MAJ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredEntries.map((entry, index) => (
                  <tr key={index} className="transition-colors hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-violet-400">{entry.path}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                        {entry.priority.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getFrequencyColor(entry.changeFrequency)}`}>
                        {entry.changeFrequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(entry.lastModified).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-violet-400 transition-colors hover:text-violet-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Voir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">Aucune URL trouvée</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <p>
            Affichage de {filteredEntries.length} sur {entries.length} URLs
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-violet-400 transition-colors hover:text-violet-300"
          >
            <FileText className="h-4 w-4" />
            Voir le sitemap.xml
          </a>
        </div>
      </div>
    </div>
  );
}
