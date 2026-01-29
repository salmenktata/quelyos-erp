'use client';

import { useState } from 'react';
import type { ThemeContextValue } from '../../../../engine/types';

interface WithBackgroundProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function WithBackground({ config, className = '', theme }: WithBackgroundProps) {
  const title = (config?.title as string) || 'Ne Manquez Rien';
  const subtitle = (config?.subtitle as string) || 'Offres exclusives et nouveautés directement dans votre boîte mail';
  const bgImage = (config?.backgroundImage as string) || '/images/newsletter-bg.jpg';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section
      className={`relative py-24 md:py-32 ${className}`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `${theme.colors.primary}e6`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2
          className="text-3xl md:text-5xl font-bold mb-4 text-white"
          style={{ fontFamily: `var(--theme-font-headings)` }}
        >
          {title}
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              style={{ color: theme.colors.primary }}
            >
              {status === 'loading' ? 'Inscription...' : "S'inscrire"}
            </button>
          </div>

          {status === 'success' && (
            <p className="mt-4 text-white font-semibold">
              ✓ Merci ! Vous êtes inscrit à notre newsletter.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-white font-semibold">
              ✗ Une erreur est survenue. Veuillez réessayer.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
