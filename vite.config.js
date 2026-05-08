import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows external access
    allowedHosts: [
      'edginess-cannon-flattered.ngrok-free.dev'
    ]
  }
})