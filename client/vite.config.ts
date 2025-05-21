// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      // registra el SW en cuanto cargue la app
      registerType: 'autoUpdate',
      // inyecta un pequeño <script> en tu index.html para autómaticamente
      // hacer navigator.serviceWorker.register('/sw.js')
      injectRegister: 'script',

      // Incluye estos assets estáticos en la carpeta de salida para que tu
      // manifest y SW los vean (favicon, robots.txt, iconos…)
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icons/favicon-192x192.png',
        'icons/favicon-512x512.png'
      ],

      // Genera un manifest.webmanifest con todos estos campos:
      manifest: {
        name:            'PickAndGo!',
        short_name:      'PickAndGo',
        description:     'Pide y recoge sin colas en la cafetería',
        theme_color:     '#ffffff',
        background_color:'#ffffff',
        display:         'standalone',
        orientation:     'portrait',
        scope:           '/',
        start_url:       '/',

        icons: [
          {
            src:     'icons/favicon-192x192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any maskable'
          },
          {
            src:     'icons/favicon-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
