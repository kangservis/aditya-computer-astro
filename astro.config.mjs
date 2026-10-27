// Lokasi: astro.config.mjs
// Timpa seluruh isi file ini

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  vite: {
    plugins: [tailwindcss()]
  }
});