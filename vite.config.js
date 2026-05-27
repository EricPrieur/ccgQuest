import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/ccgQuest/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3001,
  },
});
