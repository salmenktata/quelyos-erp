'use client';

import { useTheme } from '../../../engine/ThemeContext';
import { logger } from '@/lib/logger';
import VideoBackground from './variants/VideoBackground';
import Parallax from './variants/Parallax';
import Centered from './variants/Centered';

interface HeroProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function Hero({ variant, config, className }: HeroProps) {
  const { colors } = useTheme();

  const variantComponents = {
    'video-background': VideoBackground,
    parallax: Parallax,
    centered: Centered,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    logger.warn(`Hero variant "${variant}" not found, using centered`);
    return <Centered config={config} className={className} colors={colors} />;
  }

  return <VariantComponent config={config} className={className} colors={colors} />;
}
