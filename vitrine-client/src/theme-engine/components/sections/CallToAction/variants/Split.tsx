'use client';

import type { ThemeContextValue } from '../../../../engine/types';

interface SplitProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Split({ config, className = '', theme }: SplitProps) {
  const title = (config?.title as string) || 'Transformez Votre Expérience';
  const subtitle = (config?.subtitle as string) || 'Rejoignez notre communauté et profitez d\'avantages exclusifs';
  const ctaText = (config?.ctaText as string) || 'Commencer Maintenant';
  const ctaUrl = (config?.ctaUrl as string) || '/signup';
  const image = (config?.image as string) || '/images/cta-split.jpg';

  return (
    <section className={`grid md:grid-cols-2 min-h-[500px] ${className}`}>
      {/* Image Side */}
      <div
        className="bg-cover bg-center min-h-[300px] md:min-h-0"
        style={{ backgroundImage: `url(${image})` }}
        role="img"
        aria-label="Call to action background"
      />

      {/* Content Side */}
      <div
        className="flex items-center justify-center p-8 md:p-16"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10)`,
        }}
      >
        <div className="max-w-lg">
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            {subtitle}
          </p>
          <a
            href={ctaUrl}
            className="inline-block px-10 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {ctaText}
          </a>

          {/* Features List */}
          <ul className="mt-8 space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: theme.colors.primary }}
              >
                ✓
              </span>
              <span>Offres exclusives</span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: theme.colors.primary }}
              >
                ✓
              </span>
              <span>Livraison prioritaire</span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: theme.colors.primary }}
              >
                ✓
              </span>
              <span>Points de fidélité</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
