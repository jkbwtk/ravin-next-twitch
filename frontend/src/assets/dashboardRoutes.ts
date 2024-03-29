import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import { lazy } from 'solid-js';


const sidebarElements: SidebarRoute[] = [
  {
    symbol: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    component: lazy(() => import('#pages/dashboard/Dashboard')),
  },
  {
    symbol: 'auto_fix',
    name: 'Commands',
    href: '/dashboard/commands',
    auxRoutes: [
      {
        symbol: 'tune',
        name: 'Custom',
        href: '/dashboard/commands/custom',
        component: lazy(() => import('#pages/dashboard/CustomCommand')),
      },
      {
        symbol: 'monitor_heart',
        name: 'Status',
        href: '/dashboard/commands/status',
        component: lazy(() => import('#pages/dashboard/CommandStatus')),
      },
      {
        symbol: 'psychology',
        name: 'Ai',
        href: '/dashboard/commands/ai',
        auxRoutes: [
          {
            symbol: 'add',
            name: 'Add',
            href: '/dashboard/commands/ai/add',
          },
        ],
      },
    ],
  },
  {
    name: 'Templates',
    symbol: 'description',
    href: '/dashboard/templates',
    component: lazy(() => import('#pages/dashboard/Templates')),
  },
  {
    symbol: 'psychology',
    name: 'Ai',
    href: '/dashboard/ai',
  },
  {
    symbol: 'event_note',
    name: 'Logs',
    href: '/dashboard/logs',
    component: lazy(() => import('#pages/dashboard/Logs')),
  },
  {
    symbol: 'quick_reference',
    name: 'Help',
    href: '/dashboard/help',
    component: lazy(() => import('#pages/dashboard/Help')),
  },
  {
    symbol: 'admin_panel_settings',
    name: 'Admin',
    href: '/dashboard/admin',
    adminOnly: true,
    component: lazy(() => import('#pages/dashboard/Admin')),
  },
  {
    symbol: 'settings',
    name: 'Settings',
    href: '/dashboard/settings',
    component: lazy(() => import('#pages/dashboard/Settings')),
  },
];

export default sidebarElements;
