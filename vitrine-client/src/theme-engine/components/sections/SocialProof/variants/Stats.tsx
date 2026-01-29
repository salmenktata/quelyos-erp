'use client';

import { Users, ShoppingBag, Star, Award } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface StatsProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

const DEFAULT_STATS = [
  { icon: 'users', value: '10,000+', label: 'Clients Satisfaits' },
  { icon: 'shopping-bag', value: '50,000+', label: 'Commandes Livrées' },
  { icon: 'star', value: '4.9/5', label: 'Note Moyenne' },
  { icon: 'award', value: '98%', label: 'Taux de Satisfaction' },
];

export default function Stats({ config, className = '', theme }: StatsProps) {
  const stats = (config?.stats as typeof DEFAULT_STATS) || DEFAULT_STATS;

  const getIcon = (iconName: string) => {
    const icons = {
      users: Users,
      'shopping-bag': ShoppingBag,
      star: Star,
      award: Award,
    };
    const Icon = icons[iconName as keyof typeof icons] || Users;
    return <Icon className="h-8 w-8" />;
  };

  return (
    <section className={`py-16 md:py-24 ${className}`} style={{ backgroundColor: theme.colors.primary }}>
      <div className="container mx-auto px-4" style={{ maxWidth: theme.spacing.containerWidth }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="inline-flex items-center justify-center mb-4">{getIcon(stat.icon)}</div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
