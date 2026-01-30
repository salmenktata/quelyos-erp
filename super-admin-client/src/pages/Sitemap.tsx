/**
 * Page Sitemap - Vue d'ensemble routes multi-apps
 *
 * Fonctionnalités :
 * 1. Liste routes Vitrine Quelyos (Next.js 14, port 3000)
 * 2. Liste routes Dashboard Client (React/Vite, port 5175)
 * 3. Liste routes Super Admin Client (React/Vite, port 5176)
 * 4. Liste routes Boutique E-commerce (Next.js 16, port 3001)
 * 5. Liens cliquables vers chaque route (nouvel onglet)
 * 6. Groupement visuel par application
 * 7. Compteurs routes par app + total global
 * 8. Design adaptatif dark/light mode
 * 9. Filtres avancés (app, module, type)
 * 10. URL state (query params)
 */

import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ExternalLink, Search, Filter, X } from 'lucide-react'
import { enrichedSitemapData, getSitemapStats, getDashboardModules, type AppSection, type AppRoute } from '@/config/sitemap'

type RouteType = 'static' | 'dynamic'

export function Sitemap() {
  const [searchParams, setSearchParams] = useSearchParams()

  // État filtres depuis URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    new Set(searchParams.get('apps')?.split(',').filter(Boolean) || [])
  )
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(searchParams.get('modules')?.split(',').filter(Boolean) || [])
  )
  const [selectedTypes, setSelectedTypes] = useState<Set<RouteType>>(
    new Set((searchParams.get('types')?.split(',').filter(Boolean) || []) as RouteType[])
  )

  const stats = getSitemapStats()
  const dashboardModules = getDashboardModules()

  // Mettre à jour URL params quand filtres changent
  const updateUrlParams = (
    search: string,
    apps: Set<string>,
    modules: Set<string>,
    types: Set<RouteType>
  ) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (apps.size > 0) params.set('apps', Array.from(apps).join(','))
    if (modules.size > 0) params.set('modules', Array.from(modules).join(','))
    if (types.size > 0) params.set('types', Array.from(types).join(','))
    setSearchParams(params)
  }

  // Toggle filtre app
  const toggleApp = (appId: string) => {
    const newSelected = new Set(selectedApps)
    if (newSelected.has(appId)) {
      newSelected.delete(appId)
    } else {
      newSelected.add(appId)
    }
    setSelectedApps(newSelected)
    updateUrlParams(searchQuery, newSelected, selectedModules, selectedTypes)
  }

  // Toggle filtre module
  const toggleModule = (module: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(module)) {
      newSelected.delete(module)
    } else {
      newSelected.add(module)
    }
    setSelectedModules(newSelected)
    updateUrlParams(searchQuery, selectedApps, newSelected, selectedTypes)
  }

  // Toggle filtre type
  const toggleType = (type: RouteType) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
    updateUrlParams(searchQuery, selectedApps, selectedModules, newSelected)
  }

  // Reset tous les filtres
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedApps(new Set())
    setSelectedModules(new Set())
    setSelectedTypes(new Set())
    setSearchParams(new URLSearchParams())
  }

  // Appliquer tous les filtres
  const filteredData = useMemo(() => {
    return enrichedSitemapData.map(app => {
      // Filtre app
      if (selectedApps.size > 0 && !selectedApps.has(app.id)) {
        return { ...app, routes: [] }
      }

      // Filtre routes
      const filteredRoutes = app.routes.filter((route: AppRoute & { type: RouteType }) => {
        // Filtre recherche
        const matchSearch =
          !searchQuery ||
          route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.module?.toLowerCase().includes(searchQuery.toLowerCase())

        // Filtre module (seulement Dashboard)
        const matchModule =
          selectedModules.size === 0 ||
          (route.module && selectedModules.has(route.module))

        // Filtre type
        const matchType = selectedTypes.size === 0 || selectedTypes.has(route.type)

        return matchSearch && matchModule && matchType
      })

      return { ...app, routes: filteredRoutes }
    })
  }, [searchQuery, selectedApps, selectedModules, selectedTypes])

  // Compteurs
  const totalFiltered = filteredData.reduce((acc, app) => acc + app.routes.length, 0)
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedApps.size > 0 ||
    selectedModules.size > 0 ||
    selectedTypes.size > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sitemap Architecture</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Vue d&apos;ensemble des routes de l&apos;écosystème Quelyos
          </p>
        </div>

        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {totalFiltered}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Résultats</div>
            </div>
          )}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRoutes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Routes totales</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApps}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une route, module ou nom..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            updateUrlParams(e.target.value, selectedApps, selectedModules, selectedTypes)
          }}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
        />
      </div>

      {/* Filtres avancés */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtres</h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                {[selectedApps.size, selectedModules.size, selectedTypes.size]
                  .filter(n => n > 0)
                  .reduce((a, b) => a + b, 0)}{' '}
                actifs
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filtre Applications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Applications
          </label>
          <div className="flex flex-wrap gap-2">
            {enrichedSitemapData.map(app => {
              const isSelected = selectedApps.has(app.id)
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    isSelected
                      ? `${app.bgColor} ${app.darkBgColor} ${app.color} border-current font-medium`
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{app.name}</span>
                  <span className="text-xs opacity-70">
                    ({app.routes.length})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filtre Modules (Dashboard uniquement) */}
        {dashboardModules.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modules Dashboard
            </label>
            <div className="flex flex-wrap gap-2">
              {dashboardModules.map(module => {
                const isSelected = selectedModules.has(module)
                const dashboardApp = enrichedSitemapData.find(app => app.id === 'dashboard-client')
                const count = dashboardApp?.routes.filter(r => r.module === module).length || 0
                return (
                  <button
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-medium'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {module}{' '}
                    <span className="text-xs opacity-70">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filtre Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de route
          </label>
          <div className="flex flex-wrap gap-2">
            {(['static', 'dynamic'] as RouteType[]).map(type => {
              const isSelected = selectedTypes.has(type)
              // Calculer count en tenant compte des filtres Apps et Modules
              const count = enrichedSitemapData.reduce((acc, app) => {
                // Skip si app filtrée
                if (selectedApps.size > 0 && !selectedApps.has(app.id)) {
                  return acc
                }

                // Filtrer routes par module et compter type
                return acc + app.routes.filter((r: AppRoute & { type: RouteType }) => {
                  const matchModule = selectedModules.size === 0 || (r.module && selectedModules.has(r.module))
                  return matchModule && r.type === type
                }).length
              }, 0)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-medium'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {type === 'static' ? 'Statiques' : 'Dynamiques'}{' '}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Apps Sections */}
      <div className="space-y-6">
        {filteredData.map(app => (
          <AppSectionCard key={app.id} app={app} />
        ))}
      </div>

      {/* Empty state si aucun résultat */}
      {totalFiltered === 0 && hasActiveFilters && (
        <div className="text-center py-12">
          <Filter className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune route trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  )
}

interface AppSectionCardProps {
  app: AppSection & {
    routes: (AppRoute & { type: 'static' | 'dynamic' })[]
  }
}

function AppSectionCard({ app }: AppSectionCardProps) {
  const Icon = app.icon

  // Grouper routes par module (si module défini)
  const routesByModule = app.routes.reduce((acc, route) => {
    const module = route.module || 'Général'
    if (!acc[module]) {
      acc[module] = []
    }
    acc[module].push(route)
    return acc
  }, {} as Record<string, typeof app.routes>)

  const modules = Object.keys(routesByModule).sort()

  // Si aucune route après filtrage, ne pas afficher
  if (app.routes.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`${app.bgColor} ${app.darkBgColor} px-6 py-4 border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${app.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Port <span className="font-mono font-semibold">{app.port}</span>
                </span>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <a
                  href={app.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  {app.baseUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full ${app.bgColor} ${app.darkBgColor}`}>
            <span className={`text-sm font-semibold ${app.color}`}>
              {app.routes.length} {app.routes.length === 1 ? 'route' : 'routes'}
            </span>
          </div>
        </div>
      </div>

      {/* Routes groupées par module */}
      <div className="p-6 space-y-6">
        {modules.map(module => (
          <div key={module}>
            {modules.length > 1 && (
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {module}
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {routesByModule[module].map((route, idx) => (
                <a
                  key={idx}
                  href={`${app.baseUrl}${route.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {route.name}
                      </div>
                      {route.type === 'dynamic' && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          dynamic
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                      {route.path}
                    </div>
                    {route.description && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {route.description}
                      </div>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
