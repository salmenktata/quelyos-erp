'use client';

import { Truck, Shield, CreditCard, HeadphonesIcon } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface IconsRowProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

const DEFAULT_FEATURES = [
  { icon: 'truck', title: 'Livraison Rapide' },
  { icon: 'shield', title: 'Paiement Sécurisé' },
  { icon: 'credit-card', title: 'Paiement Flexible' },
  { icon: 'headphones', title: 'Support 24/7' },
];

export default function IconsRow({ config, className = '', theme }: IconsRowProps) {
  const features = (config?.features as typeof DEFAULT_FEATURES) || DEFAULT_FEATURES;

  const getIcon = (iconName: string) => {
    const icons = {
      truck: Truck,
      shield: Shield,
      'credit-card': CreditCard,
      headphones: HeadphonesIcon,
    };
    const Icon = icons[iconName as keyof typeof icons] || Truck;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <section className={`py-8 border-y border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="container mx-auto px-4" style={{ maxWidth: theme.spacing.containerWidth }}>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div style={{ color: theme.colors.primary }}>{getIcon(feature.icon)}</div>
              <span className="font-medium text-gray-900 dark:text-white">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
