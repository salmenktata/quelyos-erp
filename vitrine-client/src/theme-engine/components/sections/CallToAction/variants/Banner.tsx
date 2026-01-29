'use client';

import type { ThemeContextValue } from '../../../../engine/types';
import { ArrowRight } from 'lucide-react';

interface BannerProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Banner({ config, className = '', theme }: BannerProps) {
  const title = (config?.title as string) || 'Prêt à Commencer ?';
  const subtitle = (config?.subtitle as string) || 'Rejoignez des milliers de clients satisfaits';
  const ctaText = (config?.ctaText as string) || 'Découvrir';
  const ctaUrl = (config?.ctaUrl as string) || '/shop';

  return (
    <section
      className={`py-12 md:py-16 ${className}`}
      style={{
        backgroundColor: theme.colors.primary,
      }}
    >
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: `var(--theme-font-headings)` }}
            >
              {title}
            </h2>
            <p className="text-lg text-white/90">
              {subtitle}
            </p>
          </div>
          <a
            href={ctaUrl}
            className="flex-shrink-0 px-8 py-4 bg-white rounded-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
            style={{ color: theme.colors.primary }}
          >
            {ctaText}
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
