'use client';

import { lazy, Suspense } from 'react';
import type { SectionProps } from '../../../engine/types';

const Centered = lazy(() => import('./variants/Centered'));
const Split = lazy(() => import('./variants/Split'));
const Minimal = lazy(() => import('./variants/Minimal'));

export default function PromoBanner({ variant = 'centered', config, className, theme }: SectionProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'split':
        return <Split config={config} className={className} theme={theme} />;
      case 'minimal':
        return <Minimal config={config} className={className} theme={theme} />;
      case 'centered':
      default:
        return <Centered config={config} className={className} theme={theme} />;
    }
  };

  return (
    <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
      {renderVariant()}
    </Suspense>
  );
}
