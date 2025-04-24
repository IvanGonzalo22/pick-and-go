import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png',
        'favicon-192x192.png',
        'favicon-512x512.png'
      ],
      manifest: {
        name: 'Pick & Go',
        short_name: 'PickGo',
        description: 'App para pedidos rápidos de recreo',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ff0000',
        icons: [
          {
            src: 'favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
