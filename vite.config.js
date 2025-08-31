import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Allow all hosts
    port: 3000,
    strictPort: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '8000-iw4kcuo6hkhvc1968xb0z-5e554130.manusvm.computer',
      '.manusvm.computer'
    ]
  }
})
