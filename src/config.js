// Backend URL.
//
//  * Production (Vercel): set VITE_API_URL = https://YOUR-BACKEND.onrender.com   (no trailing slash)
//  * Local development  : leave VITE_API_URL EMPTY. Requests go to "/backend", and the Vite dev server
//                         forwards them to your local backend (see vite.config.ts). Because the browser only
//                         talks to the page's own origin there is no CORS problem, and it works the same
//                         from localhost, 127.0.0.1 or another device on your Wi-Fi.
const envUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// ignore values copied from .env.example
const isPlaceholder = /your-backend|your-app|<.+>/i.test(envUrl);

export const API_URL = envUrl && !isPlaceholder ? envUrl : import.meta.env.DEV ? '/backend' : '';

if (!import.meta.env.DEV && !API_URL) {
  // eslint-disable-next-line no-console
  console.error('[EcoBazar] VITE_API_URL is not set. Add it in Vercel > Settings > Environment Variables and redeploy.');
}
