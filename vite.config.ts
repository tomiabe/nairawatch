import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxyPort = process.env.API_PROXY_PORT || '8787';

export default defineConfig({
  base: '/nairawatch/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${apiProxyPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
