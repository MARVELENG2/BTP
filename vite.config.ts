import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Between the Page',
        short_name: 'BetweenThePage',
        description: 'A weekly book-reading community',
        theme_color: '#2E7D4F',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,jpg,woff2}'],
        // The admin-only PDF and Word readers aren't worth downloading for every reader.
        globIgnores: ['**/mammoth*', '**/pdf*'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Book covers uploaded by the admin: keep them once seen.
            urlPattern: ({ url }) => url.pathname.includes('/storage/v1/object/public/covers/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'book-covers',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})