import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import alias from '@rollup/plugin-alias';
import { resolve } from 'path';
import {
  frontendDevelopmentPath,
  frontendProductionPath,
  serverPort,
} from './shared/src/constants';
import { cwd } from 'process';
import suidPlugin from '@suid/vite-plugin';


export default defineConfig({
  plugins: [solidPlugin(), alias(), suidPlugin()],

  root: frontendDevelopmentPath,

  server: {
    port: serverPort,
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
      { find: '#shared', replacement: resolve(cwd(), 'shared/src') },
      { find: '#types', replacement: resolve(cwd(), 'shared/src/types') },
      { find: '#components', replacement: resolve(frontendDevelopmentPath, 'src/components') },
      { find: '#pages', replacement: resolve(frontendDevelopmentPath, 'src/pages') },
      { find: '#styles', replacement: resolve(frontendDevelopmentPath, 'src/styles') },
      { find: '#assets', replacement: resolve(frontendDevelopmentPath, 'src/assets') },
      { find: '#lib', replacement: resolve(frontendDevelopmentPath, 'src/lib') },
      { find: '#providers', replacement: resolve(frontendDevelopmentPath, 'src/providers') },
    ],
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
