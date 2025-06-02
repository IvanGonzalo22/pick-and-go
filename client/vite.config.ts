import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/',
  server: {
    // Habilitar HTTPS con certificados locales
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert/localhost.pem')),
    },
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/auth': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/products': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/cart': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/orders': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/settings': {
        target: 'https://localhost:5001',
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
});
