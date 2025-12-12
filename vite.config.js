import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Polyfill for structuredClone in Node.js < 17
if (!globalThis.structuredClone) {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
})
