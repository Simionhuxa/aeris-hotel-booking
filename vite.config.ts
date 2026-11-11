import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': `http://127.0.0.1:${process.env.API_PORT ?? '3001'}` } },
  preview: { proxy: { '/api': `http://127.0.0.1:${process.env.API_PORT ?? '3001'}` } },
  build: { sourcemap: false, rollupOptions: { output: { manualChunks(id) {
    if (id.includes('node_modules')) return /(?:gsap|lenis)/.test(id) ? 'motion' : 'vendor';
    if (id.endsWith('frames.json')) return 'design';
  } } } },
});
