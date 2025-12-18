import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['lucia']
    }
  }
});
