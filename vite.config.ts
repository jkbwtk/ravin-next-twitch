import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import alias from '@rollup/plugin-alias';
import { resolve } from 'path';
import {
  defaultServerPort,
  frontendDevelopmentPath,
  frontendProductionPath,
} from './backend/src/constants';


export default defineConfig({
  plugins: [solidPlugin(), alias()],

  root: frontendDevelopmentPath,

  server: {
    port: defaultServerPort,
    host: '0.0.0.0',
  },

  build: {
    minify: 'esbuild',
    manifest: true,
    target: 'esnext',
    outDir: frontendProductionPath,
    cssTarget: 'esnext',
    emptyOutDir: true,
  },

  resolve: {
    alias: [
      { find: '#root', replacement: resolve(frontendDevelopmentPath, '.') },
      { find: '#components', replacement: resolve(frontendDevelopmentPath, 'src/components') },
      { find: '#pages', replacement: resolve(frontendDevelopmentPath, 'src/pages') },
      { find: '#styles', replacement: resolve(frontendDevelopmentPath, 'src/styles') },
      { find: '#assets', replacement: resolve(frontendDevelopmentPath, 'src/assets') },
    ],
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
