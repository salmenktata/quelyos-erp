'use client';

import { lazy, Suspense } from 'react';
import type { SectionProps } from '../../../engine/types';

const Grid = lazy(() => import('./variants/Grid'));
const Marquee = lazy(() => import('./variants/Marquee'));

export default function BrandLogos({ variant = 'grid', config, className, theme }: SectionProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'marquee':
        return <Marquee config={config} className={className} theme={theme} />;
      case 'grid':
      default:
        return <Grid config={config} className={className} theme={theme} />;
    }
  };

  return (
    <Suspense fallback={<div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
      {renderVariant()}
    </Suspense>
  );
}
