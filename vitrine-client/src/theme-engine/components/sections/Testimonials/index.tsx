'use client';

import { useTheme } from '../../../engine/ThemeContext';
import Grid from './variants/Grid';
import Carousel from './variants/Carousel';

interface TestimonialsProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function Testimonials({ variant, config, className }: TestimonialsProps) {
  const theme = useTheme();

  const variantComponents = {
    grid: Grid,
    carousel: Carousel,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`Testimonials variant "${variant}" not found, using grid`);
    return <Grid config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
