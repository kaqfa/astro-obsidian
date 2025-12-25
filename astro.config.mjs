import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { cacheWarming } from './src/integrations/cache-warming.ts';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  integrations: [
    react(),
    cacheWarming()
  ],
  // Enable prefetching for faster navigation
  prefetch: true,
  // Enable experimental view transitions for smoother page loads
  experimental: {
    clientPrerender: true
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['lucia']
    }
  }
});
