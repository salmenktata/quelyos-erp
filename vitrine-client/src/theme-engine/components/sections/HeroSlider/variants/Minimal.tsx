'use client';

import type { ThemeColors } from '../../../../engine/types';

interface MinimalProps {
  config?: Record<string, unknown>;
  className?: string;
  colors: ThemeColors;
}

export default function Minimal({ config, className = '', colors }: MinimalProps) {
  const title = (config?.title as string) || 'Bienvenue';
  const subtitle = (config?.subtitle as string) || 'Découvrez nos produits exceptionnels';

  return (
    <section
      className={`py-24 md:py-32 text-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`}
    >
      <div className="container mx-auto px-4">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white"
          style={{
            fontFamily: `var(--theme-font-headings)`,
            color: colors.primary,
          }}
        >
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
