'use client';

import { lazy, Suspense } from 'react';
import type { SectionProps } from '../../../engine/types';

const Grid3Cols = lazy(() => import('./variants/Grid3Cols'));
const IconsRow = lazy(() => import('./variants/IconsRow'));

export default function Features({ variant = 'grid-3cols', config, className, theme }: SectionProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'icons-row':
        return <IconsRow config={config} className={className} theme={theme} />;
      case 'grid-3cols':
      default:
        return <Grid3Cols config={config} className={className} theme={theme} />;
    }
  };

  return (
    <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
      {renderVariant()}
    </Suspense>
  );
}
