// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://trainingcenter.example',
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
