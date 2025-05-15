import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@pages': '/src/pages',
      '@routes': '/src/routes',
      '@utils': '/src/utils',
      '@layouts': '/src/layouts',
      '@components': '/src/components',
      '@assets': '/src/assets',
    }
  }
})
