import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['bcrypt', '@mapbox/node-pre-gyp']
  },
  build: {
    outDir: 'build',  // Change this if needed
    rollupOptions: {
      external: ['path', 'fs', 'events', 'util']
    }
  }
});
