'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface CenteredProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Centered({ config, className = '', theme }: CenteredProps) {
  const title = (config?.title as string) || 'Contactez-Nous';
  const subtitle = (config?.subtitle as string) || 'Une question ? Notre équipe vous répond sous 24h';

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className={`py-16 md:py-24 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {loading ? 'Envoi...' : 'Envoyer'}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
