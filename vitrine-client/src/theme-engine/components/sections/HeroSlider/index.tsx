'use client';

import { useTheme } from '../../../engine/ThemeContext';
import FullscreenAutoplay from './variants/FullscreenAutoplay';
import SplitScreen from './variants/SplitScreen';
import Minimal from './variants/Minimal';

interface HeroSliderProps {
  variant: string;
  config?: Record<string, unknown>;
  className?: string;
}

export default function HeroSlider({ variant, config, className }: HeroSliderProps) {
  const { colors } = useTheme();

  const variantComponents = {
    'fullscreen-autoplay': FullscreenAutoplay,
    'split-screen': SplitScreen,
    minimal: Minimal,
  };

  const VariantComponent = variantComponents[variant as keyof typeof variantComponents];

  if (!VariantComponent) {
    console.warn(`HeroSlider variant "${variant}" not found, using fullscreen-autoplay`);
    return <FullscreenAutoplay config={config} className={className} colors={colors} />;
  }

  return <VariantComponent config={config} className={className} colors={colors} />;
}
