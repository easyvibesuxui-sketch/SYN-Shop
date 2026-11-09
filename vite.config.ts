import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works from any folder (GitHub Pages, a sub-path, a file share).
  base: './',
  // `@syn` is the Syn design system: components, tokens and styles, copied into ./syn.
  resolve: { alias: { '@syn': resolve(root, 'syn') } },
});
