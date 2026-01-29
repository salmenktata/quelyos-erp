'use client';

import type { ThemeColors } from '../../../../engine/types';

interface CenteredProps {
  config?: Record<string, unknown>;
  className?: string;
  colors: ThemeColors;
}

export default function Centered({ config, className = '', colors }: CenteredProps) {
  const title = (config?.title as string) || 'Bienvenue';
  const subtitle = (config?.subtitle as string) || 'Découvrez notre sélection de produits exceptionnels';
  const description = (config?.description as string) || '';
  const cta = (config?.cta as { text: string; url: string }) || {
    text: 'Commencer',
    url: '/shop',
  };
  const secondaryCta = config?.secondaryCta as { text: string; url: string } | undefined;

  return (
    <section
      className={`py-32 md:py-40 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}
    >
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent"
          style={{ fontFamily: `var(--theme-font-headings)` }}
        >
          {title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={cta.url}
            className="px-10 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
            }}
          >
            {cta.text}
          </a>

          {secondaryCta && (
            <a
              href={secondaryCta.url}
              className="px-10 py-4 text-lg font-semibold rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              {secondaryCta.text}
            </a>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-8 opacity-30">
          <div
            className="w-16 h-1 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          <div
            className="w-16 h-1 rounded-full"
            style={{ backgroundColor: colors.secondary }}
          />
          <div
            className="w-16 h-1 rounded-full"
            style={{ backgroundColor: colors.accent || colors.primary }}
          />
        </div>
      </div>
    </section>
  );
}
