'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface MinimalProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Minimal({ config, className = '', theme }: MinimalProps) {
  const title = (config?.title as string) || 'Livraison Gratuite dès 50 TND';
  const ctaText = (config?.ctaText as string) || 'En savoir plus';
  const ctaUrl = (config?.ctaUrl as string) || '/shipping';

  return (
    <section className={`py-4 ${className}`} style={{ backgroundColor: theme.colors.accent }}>
      <div className="container mx-auto px-4" style={{ maxWidth: theme.spacing.containerWidth }}>
        <div className="flex items-center justify-center gap-4 text-white">
          <span className="text-sm md:text-base font-medium">{title}</span>
          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
