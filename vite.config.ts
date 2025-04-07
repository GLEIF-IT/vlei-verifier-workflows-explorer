import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["*", "39ee-87-116-161-119.ngrok-free.app"],
    port: 5173,
  }
})
