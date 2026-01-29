'use client';

import { useTheme } from '../../../engine/ThemeContext';
import Banner from './variants/Banner';
import Centered from './variants/Centered';
import Split from './variants/Split';

interface CallToActionProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function CallToAction({ variant, config, className }: CallToActionProps) {
  const theme = useTheme();

  const variantComponents = {
    banner: Banner,
    centered: Centered,
    split: Split,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`CallToAction variant "${variant}" not found, using banner`);
    return <Banner config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
