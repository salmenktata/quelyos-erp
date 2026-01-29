'use client';

import { useTheme } from '../../../engine/ThemeContext';
import Icons from './variants/Icons';
import Stats from './variants/Stats';

interface TrustBadgesProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function TrustBadges({ variant, config, className }: TrustBadgesProps) {
  const theme = useTheme();

  const variantComponents = {
    icons: Icons,
    stats: Stats,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`TrustBadges variant "${variant}" not found, using icons`);
    return <Icons config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
