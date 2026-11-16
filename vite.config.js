import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If you deploy to a sub-folder (e.g. GitHub Pages project site), set base: '/repo-name/'
// (the admin panel and photo uploads need the Node server, which serves the site from the root).
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    // During development the website talks to the Node server on port 3001.
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
