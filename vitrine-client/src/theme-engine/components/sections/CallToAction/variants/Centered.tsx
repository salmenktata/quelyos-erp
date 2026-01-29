'use client';

import type { ThemeContextValue } from '../../../../engine/types';

interface CenteredProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Centered({ config, className = '', theme }: CenteredProps) {
  const title = (config?.title as string) || 'Commencez Votre Aventure';
  const subtitle = (config?.subtitle as string) || 'Des produits d\'exception vous attendent';
  const ctaText = (config?.ctaText as string) || 'Explorer la boutique';
  const ctaUrl = (config?.ctaUrl as string) || '/shop';
  const secondaryCtaText = config?.secondaryCtaText as string | undefined;
  const secondaryCtaUrl = config?.secondaryCtaUrl as string | undefined;

  return (
    <section className={`py-20 md:py-28 bg-white dark:bg-gray-900 ${className}`}>
      <div
        className="container mx-auto px-4 text-center"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        <h2
          className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
          style={{ fontFamily: `var(--theme-font-headings)` }}
        >
          {title}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={ctaUrl}
            className="px-10 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {ctaText}
          </a>

          {secondaryCtaText && secondaryCtaUrl && (
            <a
              href={secondaryCtaUrl}
              className="px-10 py-4 text-lg font-semibold rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
              }}
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
