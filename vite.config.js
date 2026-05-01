import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://gith.pythonanywhere.com/api/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/media': {  // ADD THIS - Proxy for media files
        target: 'https://gith.pythonanywhere.com/media/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})