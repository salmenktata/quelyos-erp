'use client';

import { useTheme } from '../../../engine/ThemeContext';
import FormAndInfo from './variants/FormAndInfo';
import Minimal from './variants/Minimal';

interface ContactProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function Contact({ variant, config, className }: ContactProps) {
  const theme = useTheme();

  const variantComponents = {
    'form-and-info': FormAndInfo,
    minimal: Minimal,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`Contact variant "${variant}" not found, using form-and-info`);
    return <FormAndInfo config={config} className={className} theme={theme} />;
  }

  return <VariantComponent config={config} className={className} theme={theme} />;
}
