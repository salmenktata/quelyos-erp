'use client';

import { useTheme } from '../../../engine/ThemeContext';
import Accordion from './variants/Accordion';
import TwoColumns from './variants/TwoColumns';

interface FAQProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function FAQ({ variant, config, className }: FAQProps) {
  const theme = useTheme();

  const variantComponents = {
    accordion: Accordion,
    'two-columns': TwoColumns,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`FAQ variant "${variant}" not found, using accordion`);
    return <Accordion config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
