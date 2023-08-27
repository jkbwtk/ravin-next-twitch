import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';
import { convertToRouteDefinitions, recursiveRouteFilter } from '#components/DashboardSidebar/SidebarUtils';
import { z } from 'zod';

// bundle homepage and error pages with the main bundle
import Homepage from '#pages/Homepage';
import Error404 from '#pages/Error404';

import routeDef from '#assets/dashboardRoutes';
import { useSession } from '#providers/SessionProvider';
const children = convertToRouteDefinitions('/dashboard', routeDef);

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Homepage,
  },
  {
    path: '/test',
    children: [
      {
        path: '/button',
        component: lazy(() => import('#pages/ButtonTest')),
      },
      {
        path: '/notification',
        component: lazy(() => import('#pages/NotificationTest')),
      },
    ],
  },
  {
    path: '/dashboard',
    component: lazy(() => import('#pages/DashboardOutlet')),
    children,
  },
  {
    path: '/onboarding',
    component: lazy(() => import('#pages/Onboarding')),
  },
  {
    path: '**',
    component: Error404,
  },
];

const RoutePermissionSchema = z.object({
  adminOnly: z.boolean().default(false),
});

export const getRoutes = (): RouteDefinition[] => {
  const [session] = useSession();

  return recursiveRouteFilter(routes, (route) => {
    if (typeof route.data === 'function') {
      const data = RoutePermissionSchema.safeParse((route.data as () => unknown)());

      if (
        data.success &&
        data.data.adminOnly &&
        !session.user?.admin
      ) return false;
    }

    return true;
  });
};
