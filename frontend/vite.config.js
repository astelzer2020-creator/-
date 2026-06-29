import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/node': { target: 'http://localhost:3001', rewrite: path => path.replace('/api/node', '') },
      '/api/python': { target: 'http://localhost:8001', rewrite: path => path.replace('/api/python', '') }
    }
  }
})
