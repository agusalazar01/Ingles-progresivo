import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

// La app conoce su versión y número de compilación para detectar actualizaciones.
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD__: JSON.stringify(Number(process.env.BUILD_NUMBER ?? 0)),
  },
})
