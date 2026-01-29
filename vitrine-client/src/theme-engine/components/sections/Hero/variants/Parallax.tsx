'use client';

import { useEffect, useState } from 'react';
import type { ThemeColors } from '../../../../engine/types';

interface ParallaxProps {
  config?: Record<string, unknown>;
  className?: string;
  colors: ThemeColors;
}

export default function Parallax({ config, className = '', colors }: ParallaxProps) {
  const backgroundImage = (config?.backgroundImage as string) || '/images/hero/parallax-bg.jpg';
  const title = (config?.title as string) || 'Élégance & Qualité';
  const subtitle = (config?.subtitle as string) || 'Des produits d\'exception pour vous';
  const cta = (config?.cta as { text: string; url: string }) || {
    text: 'Explorer',
    url: '/shop',
  };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={`relative h-[80vh] overflow-hidden ${className}`}>
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: `translateY(${scrollY * 0.5}px)`,
          willChange: 'transform',
        }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${colors.primary}40, ${colors.primary}80)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            {subtitle}
          </p>
          <a
            href={cta.url}
            className="inline-block px-10 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 shadow-xl"
            style={{
              backgroundColor: colors.secondary,
              color: colors.text,
            }}
          >
            {cta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
