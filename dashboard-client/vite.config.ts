import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ExcelJS dans son propre chunk (lazy loaded)
          if (id.includes('exceljs')) {
            return 'exceljs';
          }
          // Recharts dans son propre chunk
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // Lucide icons séparément
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // TanStack (React Query, React Table)
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          // Date-fns
          if (id.includes('date-fns')) {
            return 'date-fns';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@quelyos/logger': fileURLToPath(new URL('../shared/logger/src', import.meta.url)),
      '@quelyos/types': fileURLToPath(new URL('../shared/types/src', import.meta.url)),
      '@quelyos/api-client': fileURLToPath(new URL('../shared/api-client/src', import.meta.url)),
      '@quelyos/ui/animated': fileURLToPath(new URL('./src/lib/finance/compat/animated.tsx', import.meta.url)),
    },
  },
  server: {
    port: 5175,
    open: true,
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
