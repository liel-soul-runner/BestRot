import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves this app from the domain root. Keep asset paths absolute.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
