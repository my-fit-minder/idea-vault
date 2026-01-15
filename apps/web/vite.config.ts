import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  resolve: {
    alias: {
      '@idea-vault/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
    dedupe: ['react', 'react-dom'], // Ensure single instance of React
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'zustand', '@supabase/supabase-js'],
  },
})
