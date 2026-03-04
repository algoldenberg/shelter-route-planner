import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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