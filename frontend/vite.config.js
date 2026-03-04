import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Добавляем timestamp к CSS для cache busting
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return `assets/[name]-[hash]-${Date.now()}[extname]`
          }
          return 'assets/[name]-[hash][extname]'
        },
        // Также для JS файлов
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`
      }
    }
  }
})