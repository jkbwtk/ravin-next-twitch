import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';
import { convertToRouteDefinitions } from '#components/DashboardSidebar/SidebarUtils';

// bundle homepage and error pages with the main bundle
import Homepage from '#pages/Homepage';
import Error404 from '#pages/Error404';

import routeDef from '#assets/dashboardRoutes';
const children = convertToRouteDefinitions('/dashboard', routeDef);

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
    path: '/dashboard',
    children,
  },
  {
    path: '**',
    component: Error404,
  },
];
