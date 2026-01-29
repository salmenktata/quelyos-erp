'use client';

import Link from 'next/link';
import { Tag } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface CenteredProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Centered({ config, className = '', theme }: CenteredProps) {
  const title = (config?.title as string) || 'Offre Spéciale';
  const subtitle = (config?.subtitle as string) || 'Profitez de -30% sur tous les produits';
  const ctaText = (config?.ctaText as string) || 'Découvrir';
  const ctaUrl = (config?.ctaUrl as string) || '/products';
  const bgColor = (config?.bgColor as string) || theme.colors.primary;

  return (
    <section className={`py-12 md:py-16 ${className}`} style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4" style={{ maxWidth: theme.spacing.containerWidth }}>
        <div className="text-center text-white">
          <div className="inline-flex items-center gap-2 mb-4">
            <Tag className="h-6 w-6" />
            <span className="text-sm uppercase tracking-wide font-semibold">Promotion</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: `var(--theme-font-headings)` }}>
            {title}
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">{subtitle}</p>
          <Link
            href={ctaUrl}
            className="inline-block px-8 py-3 bg-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
            style={{ color: bgColor }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
