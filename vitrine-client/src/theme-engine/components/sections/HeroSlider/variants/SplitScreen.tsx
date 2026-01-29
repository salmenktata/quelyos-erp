'use client';

import type { ThemeColors } from '../../../../engine/types';

interface SplitScreenProps {
  config?: Record<string, unknown>;
  className?: string;
  colors: ThemeColors;
}

export default function SplitScreen({ config, className = '', colors }: SplitScreenProps) {
  const image = (config?.image as string) || '/images/hero/split-screen.jpg';
  const title = (config?.title as string) || 'Innovation & Élégance';
  const subtitle = (config?.subtitle as string) || 'Découvrez notre nouvelle collection';
  const cta = (config?.cta as { text: string; url: string }) || {
    text: 'Explorer',
    url: '/shop',
  };

  return (
    <section className={`grid md:grid-cols-2 min-h-[600px] ${className}`}>
      {/* Côté texte */}
      <div
        className="flex items-center justify-center p-8 md:p-16 bg-white dark:bg-gray-900"
        style={{ backgroundColor: `${colors.background}10` }}
      >
        <div className="max-w-lg">
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)`, color: colors.text }}
          >
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            {subtitle}
          </p>
          <a
            href={cta.url}
            className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
            }}
          >
            {cta.text}
          </a>
        </div>
      </div>

      {/* Côté image */}
      <div
        className="bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
        role="img"
        aria-label="Hero image"
      />
    </section>
  );
}
