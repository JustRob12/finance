import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  // Define environment variables
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://finance-fndz.onrender.com')
  }
})
