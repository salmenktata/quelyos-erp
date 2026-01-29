/**
 * Page de sélection et gestion des thèmes e-commerce
 *
 * Fonctionnalités :
 * - Afficher la galerie de thèmes disponibles
 * - Filtrer par catégorie (fashion, tech, food, etc.)
 * - Activer un thème pour le tenant
 * - Preview du thème actif
 * - Badges Premium/Gratuit
 */

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Breadcrumbs, Button, PageNotice } from '@/components/common';
import { storeNotices } from '@/lib/notices';
import { Palette, Check, Eye, Tag } from 'lucide-react';
import type { Theme, ThemeCategory } from '@/types/theme';

const CATEGORIES: { value: ThemeCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'fashion', label: 'Mode' },
  { value: 'tech', label: 'High-Tech' },
  { value: 'food', label: 'Alimentaire' },
  { value: 'beauty', label: 'Beauté' },
  { value: 'sports', label: 'Sports' },
  { value: 'home', label: 'Maison' },
  { value: 'general', label: 'Général' },
];

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les thèmes disponibles
  useEffect(() => {
    async function loadThemes() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/themes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: { category: selectedCategory === 'all' ? null : selectedCategory },
            id: 1,
          }),
        });

        const data = await response.json();

        if (data.result?.success) {
          setThemes(data.result.themes);
        } else {
          setError('Erreur lors du chargement des thèmes');
        }
      } catch (_err) {
        setError('Impossible de charger les thèmes');
      } finally {
        setLoading(false);
      }
    }

    loadThemes();
  }, [selectedCategory]);

  // Charger le thème actif du tenant
  useEffect(() => {
    async function loadActiveTheme() {
      try {
        const tenantId = 1; // TODO: Récupérer depuis le contexte
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tenants/${tenantId}/theme`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {},
            id: 1,
          }),
        });

        const data = await response.json();

        if (data.result?.config) {
          setActiveTheme(data.result.config.id);
        }
      } catch (_err) {
        console.error('Erreur chargement thème actif');
      }
    }

    loadActiveTheme();
  }, []);

  const handleActivateTheme = async (themeCode: string) => {
    try {
      const tenantId = 1; // TODO: Récupérer depuis le contexte
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tenants/${tenantId}/theme/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important pour l'auth
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { theme_code: themeCode },
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.result?.success) {
        setActiveTheme(themeCode);
      } else {
        alert('Erreur lors de l\'activation du thème');
      }
    } catch (_err) {
      alert('Impossible d\'activer le thème');
    }
  };

  const filteredThemes = themes.filter(
    theme => selectedCategory === 'all' || theme.category === selectedCategory
  );

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: 'Boutique', href: '/store' },
          { label: 'Thèmes', href: '/store/themes' },
        ]}
      />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thèmes
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Personnalisez l'apparence de votre boutique
            </p>
          </div>
        </div>
      </div>

      <PageNotice notices={storeNotices} page="themes" />

      {/* Filtres catégories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Liste des thèmes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des thèmes...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map(theme => (
            <div
              key={theme.id}
              className={`relative rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                activeTheme === theme.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Badge actif */}
              {activeTheme === theme.id && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-primary-600 text-white text-xs font-medium">
                  <Check className="h-3 w-3" />
                  Actif
                </div>
              )}

              {/* Badge premium */}
              {theme.is_premium && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-medium">
                  <Tag className="h-3 w-3" />
                  Premium
                </div>
              )}

              {/* Thumbnail (placeholder) */}
              <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Palette className="h-12 w-12 text-gray-400" />
              </div>

              {/* Infos thème */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {theme.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {theme.description}
              </p>

              {/* Catégorie et prix */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {theme.category}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {theme.is_premium ? `${theme.price}€` : 'Gratuit'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {activeTheme !== theme.id ? (
                  <Button
                    variant="primary"
                    onClick={() => handleActivateTheme(theme.id)}
                    className="flex-1"
                  >
                    Activer
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" disabled>
                    Activé
                  </Button>
                )}
                <Button variant="outline" className="px-3">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Aucun thème trouvé dans cette catégorie
          </p>
        </div>
      )}
    </Layout>
  );
}
