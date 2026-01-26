import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
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
      '/api/ecommerce': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        // Ne pas transmettre les cookies pour éviter les erreurs Odoo avec sessions invalides
        cookieDomainRewrite: '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Supprimer les cookies invalides pour éviter Access Denied Odoo
            proxyReq.removeHeader('cookie');
          });
        },
      },
      '/api/finance': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        // Ne pas transmettre les cookies pour éviter les erreurs Odoo avec sessions invalides
        cookieDomainRewrite: '',
        // Réécrire /api/finance vers /api/ecommerce/finance (controller Odoo)
        rewrite: (path) => path.replace(/^\/api\/finance/, '/api/ecommerce/finance'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Supprimer les cookies invalides pour éviter Access Denied Odoo
            proxyReq.removeHeader('cookie');
            console.log('[Vite Proxy] Finance API:', req.method, req.url, '→', 'http://localhost:8069/api/ecommerce/finance');
          });
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] Finance API error:', err.message);
          });
        },
      },
      '/api/settings': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
          });
        },
      },
      '/currencies': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/currencies/, '/api/ecommerce/currencies'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
          });
        },
      },
      '/dashboard': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/dashboard/, '/api/ecommerce/dashboard'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
          });
        },
      },
      '/reporting': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/reporting/, '/api/ecommerce/reporting'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
          });
        },
      },
      '/web': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
