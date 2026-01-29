'use client';

import { useTheme } from '../../../engine/ThemeContext';
import CenteredMinimal from './variants/CenteredMinimal';
import WithBackground from './variants/WithBackground';

interface NewsletterProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function Newsletter({ variant, config, className }: NewsletterProps) {
  const theme = useTheme();

  const variantComponents = {
    'centered-minimal': CenteredMinimal,
    'with-background': WithBackground,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`Newsletter variant "${variant}" not found, using centered-minimal`);
    return <CenteredMinimal config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
