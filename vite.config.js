import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import mix from 'vite-plugin-mix';

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './docs',);

export default {
  plugins: [
    svelte({
      onwarn: (warning, defaultHandler) => {
        // Ignore a11y-click-events-have-key-events warning from sveltestrap
        // This ignore can be removed after this issue is closed https://github.com/bestguy/sveltestrap/issues/509.
        if (warning.code === 'a11y-click-events-have-key-events' && (warning.filename?.includes('/node_modules/framework7-svelte') || warning.filename?.includes('svelte'))) return;
        defaultHandler(warning);
      },
    }),
    mix({
      handler: './js/api.js',
    }),
  ],
  root: SRC_DIR,
  base: '',
  publicDir: PUBLIC_DIR,
  build: {
    outDir: BUILD_DIR,
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      treeshake: false,
    },
    chunkSizeWarningLimit: 2048,
  },
  resolve: {
    alias: {
      '@': SRC_DIR,
    },
  },
  server: {
    host: true,
    port: 8080,
  },

};
