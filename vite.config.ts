import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["*", "39ee-87-116-161-119.ngrok-free.app"],
    port: 5173,
  },
  define: {
    'process.env.TEST_ENVIRONMENT': JSON.stringify(process.env.TEST_ENVIRONMENT || 'docker'),
  },
  resolve: {
    alias: {
      'timers/promises': path.resolve(__dirname, 'src/utils/timerPromises.ts'),
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
