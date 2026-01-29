'use client';

import { Truck, Shield, CreditCard, HeadphonesIcon } from 'lucide-react';
import type { ThemeContextValue } from '../../../../engine/types';

interface Grid3ColsProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

const DEFAULT_FEATURES = [
  {
    icon: 'truck',
    title: 'Livraison Rapide',
    description: 'Livraison en 24-48h dans toute la Tunisie',
  },
  {
    icon: 'shield',
    title: 'Paiement Sécurisé',
    description: 'Vos transactions sont 100% sécurisées',
  },
  {
    icon: 'credit-card',
    title: 'Paiement Flexible',
    description: 'Plusieurs modes de paiement disponibles',
  },
  {
    icon: 'headphones',
    title: 'Support 24/7',
    description: 'Notre équipe est à votre écoute',
  },
];

export default function Grid3Cols({ config, className = '', theme }: Grid3ColsProps) {
  const features = (config?.features as typeof DEFAULT_FEATURES) || DEFAULT_FEATURES.slice(0, 3);

  const getIcon = (iconName: string) => {
    const icons = {
      truck: Truck,
      shield: Shield,
      'credit-card': CreditCard,
      headphones: HeadphonesIcon,
    };
    const Icon = icons[iconName as keyof typeof icons] || Truck;
    return <Icon className="h-10 w-10" />;
  };

  return (
    <section className={`py-16 md:py-24 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4" style={{ maxWidth: theme.spacing.containerWidth }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
              >
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
