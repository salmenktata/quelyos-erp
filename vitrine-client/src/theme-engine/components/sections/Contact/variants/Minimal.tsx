'use client';

import { useState } from 'react';
import type { ThemeContextValue } from '../../../../engine/types';

interface MinimalProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Minimal({ config, className = '', theme }: MinimalProps) {
  const title = (config?.title as string) || 'Une Question ?';
  const subtitle = (config?.subtitle as string) || 'Écrivez-nous, nous vous répondrons rapidement';

  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setFormData({ email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section className={`py-20 md:py-28 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: '800px' }}
      >
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Votre email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': theme.colors.primary } as React.CSSProperties}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Votre message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Dites-nous tout..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': theme.colors.primary } as React.CSSProperties}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-8 py-4 text-lg rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {status === 'loading' ? 'Envoi...' : 'Envoyer'}
          </button>

          {status === 'success' && (
            <p className="text-center text-green-600 dark:text-green-400 font-semibold">
              ✓ Merci ! Nous vous répondrons sous 24h.
            </p>
          )}
          {status === 'error' && (
            <p className="text-center text-red-600 dark:text-red-400 font-semibold">
              ✗ Erreur. Veuillez réessayer ou nous contacter directement.
            </p>
          )}
        </form>

        {/* Alternative Contact Methods */}
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">Ou contactez-nous directement :</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="mailto:contact@example.com"
              className="hover:underline"
              style={{ color: theme.colors.primary }}
            >
              contact@example.com
            </a>
            <a
              href="tel:+21612345678"
              className="hover:underline"
              style={{ color: theme.colors.primary }}
            >
              +216 12 345 678
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
