import type { RouteDefinition } from '@solidjs/router';

// bundle homepage and error pages with the main bundle
import Homepage from '#pages/Homepage';
import Error404 from '#pages/Error404';
import { lazy } from 'solid-js';


export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Homepage,
  },
  {
    path: '/test/buttons',
    component: lazy(() => import('#pages/ButtonTest')),
  },
  {
    path: '**',
    component: Error404,
  },
];
