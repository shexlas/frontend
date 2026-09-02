import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Only used if VITE_API_URL is left unset in local (non-Docker) dev, in
    // which case api/client.js talks to http://localhost:5000 directly and
    // this proxy isn't hit. Mirrors the backend's real routes ('/api' and
    // the static '/uploads' mount in backend/src/app.js) so relative-path
    // requests also work if you test with VITE_API_URL="" outside Docker.
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
