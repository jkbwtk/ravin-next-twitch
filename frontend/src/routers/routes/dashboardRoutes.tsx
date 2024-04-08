import { checkPermissions, DynamicRouteDefinition, ExtendedRouteDefinition } from '#routers/utils';
import { lazy } from 'solid-js';


export const routes: ExtendedRouteDefinition[] = [
  {
    path: '',
    component: lazy(() => import('#pages/dashboard/Dashboard')),
    metadata: {
      symbol: 'dashboard',
      name: 'Dashboard',
    },
  },
  {
    metadata: {
      symbol: 'auto_fix',
      name: 'Commands',
    },
    path: 'commands',
    children: [
      {
        path: 'custom',
        component: lazy(() => import('#pages/dashboard/CustomCommand')),
        metadata: {
          symbol: 'tune',
          name: 'Custom',
        },
      },
      {
        path: 'status',
        component: lazy(() => import('#pages/dashboard/CommandStatus')),
        metadata: {
          symbol: 'monitor_heart',
          name: 'Status',
        },
      },
      {
        path: 'ai',
        children: [
          {
            path: 'add',
            metadata: {
              symbol: 'add',
              name: 'Add',
            },
          },
        ],
        metadata: {
          symbol: 'psychology',
          name: 'Ai',
        },
      },
    ],
  },
  {
    path: 'templates',
    component: lazy(() => import('#pages/dashboard/Templates')),
    metadata: {
      name: 'Templates',
      symbol: 'description',
    },
  },
  {
    path: 'ai',
    metadata: {
      symbol: 'psychology',
      name: 'Ai',
    },
  },
  {
    path: 'logs',
    component: lazy(() => import('#pages/dashboard/Logs')),
    metadata: {
      symbol: 'event_note',
      name: 'Logs',
    },
  },
  {
    path: 'help',
    component: lazy(() => import('#pages/dashboard/Help')),
    metadata: {
      symbol: 'quick_reference',
      name: 'Help',
    },
  },
  {
    path: 'admin',
    component: lazy(() => import('#pages/dashboard/Admin')),
    metadata: {
      symbol: 'admin_panel_settings',
      name: 'Admin',
    },
    permissions: {
      adminOnly: true,
    },
  },
  {
    path: 'settings',
    component: lazy(() => import('#pages/dashboard/Settings')),
    metadata: {
      symbol: 'settings',
      name: 'Settings',
    },
    permissions: {
      loggedIn: true,
    },
  },
];

export const dashboardRoutes: DynamicRouteDefinition = () => checkPermissions(routes);
