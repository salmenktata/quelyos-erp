'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface FullscreenProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Fullscreen({ config, className = '', theme }: FullscreenProps) {
  const title = (config?.title as string) || 'Découvrez Notre Collection';
  const subtitle = (config?.subtitle as string) || 'La mode qui vous ressemble';
  const videoUrl = (config?.videoUrl as string) || '';
  const posterUrl = (config?.posterUrl as string) || '';
  const ctaText = (config?.ctaText as string) || 'Explorer';
  const ctaUrl = (config?.ctaUrl as string) || '/products';

  return (
    <section className={`relative h-screen ${className}`}>
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.secondary }}
        >
          <Play className="h-32 w-32 text-white opacity-20" />
        </div>
      )}

      <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
        <div style={{ maxWidth: theme.spacing.containerWidth }}>
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12 opacity-90">{subtitle}</p>
          <Link
            href={ctaUrl}
            className="inline-block px-10 py-4 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-lg text-lg"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
