import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["ex-demo.webxdrm.com", ".webxdrm.com"],
    port: 5000,      // 포트 명시적 지정
    proxy: {
      '/api': {
        target: 'http://capture-logs-server:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  }
})
