/**
 * Page de démonstration du Theme Engine
 *
 * Teste le moteur de thème avec le thème Fashion Luxury
 */

import { ThemeRenderer, SectionRenderer } from '@/theme-engine';
import fashionLuxuryTheme from '@/theme-engine/themes/fashion-luxury.json';
import type { ThemeConfig } from '@/theme-engine';

export default function ThemeDemoPage() {
  const theme = fashionLuxuryTheme as ThemeConfig;

  return (
    <ThemeRenderer config={theme}>
      <div className="min-h-screen">
        {/* Rendu des sections de la homepage */}
        <SectionRenderer sections={theme.layouts.homepage.sections} />

        {/* Informations debug (en bas de page) */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              🎨 Theme Engine Debug Info
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Theme ID:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.id}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Theme Name:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Category:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.category}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Version:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.version}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Primary Color:</dt>
                  <dd className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span className="text-gray-900 dark:text-white">{theme.colors.primary}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Secondary Color:</dt>
                  <dd className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <span className="text-gray-900 dark:text-white">{theme.colors.secondary}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Headings Font:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.typography.headings}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Body Font:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.typography.body}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Sections Count:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {theme.layouts.homepage.sections.length}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-300">Container Width:</dt>
                  <dd className="text-gray-900 dark:text-white">{theme.spacing.containerWidth}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sections Rendered:
                </dt>
                <dd>
                  <ul className="list-disc list-inside text-gray-900 dark:text-white space-y-1">
                    {theme.layouts.homepage.sections.map((section, index) => (
                      <li key={index}>
                        <strong>{section.type}</strong> (variant: {section.variant})
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ThemeRenderer>
  );
}
