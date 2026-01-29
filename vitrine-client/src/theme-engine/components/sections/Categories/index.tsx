'use client';

import { lazy, Suspense } from 'react';
import type { SectionProps } from '../../../engine/types';

const Grid4Cols = lazy(() => import('./variants/Grid4Cols'));
const Carousel = lazy(() => import('./variants/Carousel'));
const Featured = lazy(() => import('./variants/Featured'));

export default function Categories({ variant = 'grid-4cols', config, className, theme }: SectionProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'carousel':
        return <Carousel config={config} className={className} theme={theme} />;
      case 'featured':
        return <Featured config={config} className={className} theme={theme} />;
      case 'grid-4cols':
      default:
        return <Grid4Cols config={config} className={className} theme={theme} />;
    }
  };

  return (
    <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
      {renderVariant()}
    </Suspense>
  );
}
