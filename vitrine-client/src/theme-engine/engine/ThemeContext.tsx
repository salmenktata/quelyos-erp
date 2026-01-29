'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeConfig, ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  config: ThemeConfig;
  children: ReactNode;
}

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const value: ThemeContextValue = {
    config,
    colors: config.colors,
    typography: config.typography,
    components: config.components,
    spacing: config.spacing,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
