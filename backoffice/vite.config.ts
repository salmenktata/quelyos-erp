import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    open: true,
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
      '/web': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
