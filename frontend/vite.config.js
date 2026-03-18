import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['shelter-icon.svg', 'shelter-icon-192.png', 'shelter-icon-512.png'],
      
      // Инлайн регистрация - важно для iOS
      injectRegister: 'auto',
      
      manifest: {
        name: 'Shelter Near You - Bomb Shelter Finder',
        short_name: 'Shelters IL',
        description: 'Find safe routes through bomb shelters in Israel',
        theme_color: '#4CAF50',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'shelter-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'shelter-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        
        // Важно для iOS: обновление каждые 60 секунд
        navigateFallback: null,
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const timestamp = Date.now()
          if (assetInfo.name.endsWith('.css')) {
            return `assets/[name]-${timestamp}[extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        entryFileNames: `assets/[name]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-${Date.now()}.js`
      }
    }
  }
})