'use client';

import type { ThemeContextValue } from '../../../../engine/types';
import { Users, Package, Star, Award } from 'lucide-react';

interface StatsProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

export default function Stats({ config, className = '', theme }: StatsProps) {
  const title = (config?.title as string) || 'Ils Nous Font Confiance';

  const stats = [
    {
      icon: Users,
      value: '50 000+',
      label: 'Clients Satisfaits',
    },
    {
      icon: Package,
      value: '100 000+',
      label: 'Commandes Livrées',
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Note Moyenne',
    },
    {
      icon: Award,
      value: '2 ans',
      label: 'Garantie Produits',
    },
  ];

  return (
    <section
      className={`py-16 md:py-20 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`,
      }}
    >
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          style={{ fontFamily: `var(--theme-font-headings)` }}
        >
          {title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Icon size={36} color="#ffffff" />
                </div>
                <div
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: theme.colors.primary }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
