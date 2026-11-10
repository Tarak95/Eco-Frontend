import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where your LOCAL backend runs (only used by `npm run dev`). macOS uses port 5000 for AirPlay, so 5001.
  const backendTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5001';

  // The browser talks to this dev server (same origin); this server talks to the backend.
  // Dropping the Origin header means the backend never rejects you with a CORS error, whatever address you
  // use to open the site (localhost, 127.0.0.1, 192.168.x.x, my-macbook.local ...).
  const backendProxy = {
    target: backendTarget,
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/backend/, ''),
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => proxyReq.removeHeader('origin'));
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        // /backend/registration  ->  http://127.0.0.1:5001/registration
        '/backend': backendProxy,
      },
    },
    preview: {
      proxy: {
        '/backend': backendProxy,
      },
    },
  };
});
