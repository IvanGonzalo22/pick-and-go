import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0',    // ← escucha en todas las IPs IPv4
    allowedHosts: true, // ← desactiva chequear el host en dev
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/cart': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/settings': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icons/favicon-192x192.png',
        'icons/favicon-512x512.png'
      ],
      manifest: {
        name: 'PickAndGo!',
        short_name: 'PickAndGo v1.0.1',
        description: 'Pide y recoge sin colas en la cafetería',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
