'use client';

import type { ThemeContextValue } from '../../../../engine/types';
import { Shield, Truck, CreditCard, Headphones } from 'lucide-react';

interface IconsProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Icons({ config, className = '', theme }: IconsProps) {
  const title = (config?.title as string) || '';

  const badges = [
    {
      icon: Shield,
      title: 'Paiement Sécurisé',
      description: 'Transactions cryptées SSL',
    },
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Sous 2 à 5 jours',
    },
    {
      icon: CreditCard,
      title: 'Paiement Flexible',
      description: 'En 3x sans frais',
    },
    {
      icon: Headphones,
      title: 'Support 7j/7',
      description: 'Assistance dédiée',
    },
  ];

  return (
    <section className={`py-16 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        {title && (
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.primary}15` }}
                >
                  <Icon size={32} style={{ color: theme.colors.primary }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {badge.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
