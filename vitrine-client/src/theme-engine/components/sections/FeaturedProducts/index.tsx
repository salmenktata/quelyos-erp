'use client';

import { useTheme } from '../../../engine/ThemeContext';
import { logger } from '@/lib/logger';
import Grid4Cols from './variants/Grid4Cols';
import Carousel from './variants/Carousel';

interface FeaturedProductsProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function FeaturedProducts({ variant, config, className }: FeaturedProductsProps) {
  const theme = useTheme();

  const variantComponents = {
    'grid-4cols': Grid4Cols,
    carousel: Carousel,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    logger.warn(`FeaturedProducts variant "${variant}" not found, using grid-4cols`);
    return <Grid4Cols config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
