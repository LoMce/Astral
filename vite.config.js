import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

// SECURITY BEST PRACTICE:
// Implement a strong Content Security Policy (CSP) via HTTP headers in your production environment.
// A strict CSP can significantly mitigate XSS and other injection attacks.
// Example starting point for a Vue 3 + Vite app (needs careful tuning):
// default-src 'self'; img-src 'self' data: <image_CDNs_if_any>; script-src 'self' 'unsafe-inline' <trusted_CDNs_if_any>; style-src 'self' 'unsafe-inline' <font_CDNs_if_any>; font-src 'self' <font_CDNs_if_any>; object-src 'none'; frame-ancestors 'none';
// Consider using a SRI for third-party scripts if any are loaded directly.
// Regularly audit your CSP and third-party dependencies.
