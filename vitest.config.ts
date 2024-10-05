import { resolve } from 'path';
import { cwd } from 'process';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: resolve(cwd()),
    exclude: ['node_modules', 'dist', 'build', 'coverage', 'public'],
    alias: [
      { find: '#shared', replacement: resolve(cwd(), 'shared/src') },
      { find: '#types', replacement: resolve(cwd(), 'shared/src/types') },
      { find: '#lib', replacement: resolve(cwd(), 'backend/src/lib') },
      { find: '#database', replacement: resolve(cwd(), 'backend/src/database') },
      { find: '#bot', replacement: resolve(cwd(), 'backend/src/bot') },
      { find: '#server', replacement: resolve(cwd(), 'backend/src/server') },
      { find: '#routers', replacement: resolve(cwd(), 'backend/src/server/routers') },
      { find: '#jobs', replacement: resolve(cwd(), 'backend/src/jobs') },
      { find: '#schema', replacement: resolve(cwd(), 'shared/src/schema') },
      { find: '#shared', replacement: resolve(cwd(), 'shared/src') },
    ],
  },
});
