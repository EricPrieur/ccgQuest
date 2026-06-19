import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  root: '.',
  publicDir: 'public',
  // Dev server runs under /ccgQuest/ccgQuest-web/; production (GitHub Pages)
  // stays at /ccgQuest/ so the deploy URL is unchanged.
  base: command === 'serve' ? '/ccgQuest/ccgQuest-web/' : '/ccgQuest/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3001,
  },
}));
