import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:4000',
        changeOrigin: true,
        secure: false, // Allows self-signed local SSL certificate in development
      },
      '/health': {
        target: 'https://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

