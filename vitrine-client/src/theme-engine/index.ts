/**
 * Quelyos Theme Engine - Point d'entrée principal
 *
 * Moteur de thème propriétaire permettant de créer des boutiques e-commerce
 * via des configurations JSON déclaratives.
 */

// Engine
export { ThemeRenderer } from './engine/ThemeRenderer';
export { SectionRenderer } from './engine/SectionRenderer';
export { ThemeProvider, useTheme } from './engine/ThemeContext';

// Types
export type {
  ThemeConfig,
  ThemeColors,
  ThemeTypography,
  ThemeLayouts,
  ThemeComponents,
  ThemeSpacing,
  ThemeContextValue,
  SectionConfig,
  SectionType,
  LayoutType,
  ProductCardVariant,
  HeaderVariant,
  FooterVariant,
  ButtonVariant,
  ThemeCategory,
} from './engine/types';

// Thèmes pré-configurés
export { default as fashionLuxuryTheme } from './themes/fashion-luxury.json';
export { default as techMinimalTheme } from './schemas/examples/tech-minimal.json';
export { default as foodOrganicTheme } from './schemas/examples/food-organic.json';
