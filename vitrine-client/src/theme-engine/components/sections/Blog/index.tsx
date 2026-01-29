'use client';

import { useTheme } from '../../../engine/ThemeContext';
import Grid from './variants/Grid';
import Featured from './variants/Featured';

interface BlogProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function Blog({ variant, config, className }: BlogProps) {
  const theme = useTheme();

  const variantComponents = {
    grid: Grid,
    featured: Featured,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`Blog variant "${variant}" not found, using grid`);
    return <Grid config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
