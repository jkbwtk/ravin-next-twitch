import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import alias from '@rollup/plugin-alias';
import { resolve } from 'path';


const rootDir = resolve(__dirname);

export default defineConfig({
  plugins: [solidPlugin(), alias()],

  root: './frontend',

  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  build: {
    minify: 'esbuild',
    manifest: true,
    target: 'esnext',
    outDir: '../web',
    cssTarget: 'esnext',
    emptyOutDir: true,
  },

  resolve: {
    alias: [
      { find: '#root', replacement: resolve(rootDir, '.') },
      { find: '#components', replacement: resolve(rootDir, 'frontend/src/components') },
      { find: '#pages', replacement: resolve(rootDir, 'frontend/src/pages') },
      { find: '#styles', replacement: resolve(rootDir, 'frontend/src/styles') },
      { find: '#assets', replacement: resolve(rootDir, 'frontend/src/assets') },
    ],
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
