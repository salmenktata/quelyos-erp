'use client';

import type { ThemeColors } from '../../../../engine/types';

interface VideoBackgroundProps {
  config?: Record<string, unknown>;
  className?: string;
  colors: ThemeColors;
}

export default function VideoBackground({ config, className = '', colors }: VideoBackgroundProps) {
  const videoUrl = (config?.videoUrl as string) || '/videos/hero-background.mp4';
  const posterUrl = (config?.posterUrl as string) || '/images/hero/video-poster.jpg';
  const title = (config?.title as string) || 'Découvrez Notre Univers';
  const subtitle = (config?.subtitle as string) || 'Une expérience unique vous attend';
  const cta = (config?.cta as { text: string; url: string }) || {
    text: 'En savoir plus',
    url: '/about',
  };

  return (
    <section className={`relative h-screen overflow-hidden ${className}`}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <a
            href={cta.url}
            className="inline-block px-10 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
            }}
          >
            {cta.text}
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
