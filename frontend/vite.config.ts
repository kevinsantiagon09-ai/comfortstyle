import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000'
  const proxy = {
    target,
    changeOrigin: true,
    cookieDomainRewrite: '',
  }

  return {
    plugins: [react(), tailwindcss()],
    // Leaflet se carga de forma diferida: prearmarlo desde el inicio evita que Vite lo reempaquete a mitad de sesión.
    optimizeDeps: { include: ['leaflet', 'react-leaflet'] },
    server: {
      proxy: {
        '/api': { ...proxy },
        '/storage': { ...proxy },
        '/backend': {
          ...proxy,
          rewrite: (path: string) => path.replace(/^\/backend/, ''),
        },
      },
    },
  }
})
