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
        symbol: 'add',
        name: 'Add',
        href: '/dashboard/commands/add',
      },
      {
        symbol: 'webhook',
        name: 'Hooks',
        href: '/dashboard/commands/hooks',
      },
    ],
  },
  {
    symbol: 'webhook',
    name: 'Hooks',
    href: '/dashboard/hooks',
  },
  {
    symbol: 'psychology',
    name: 'Ai',
    href: '/dashboard/ai',
  },
  {
    symbol: 'event_note',
    name: 'Event Log',
    href: '/dashboard/event-log',
  },
  {
    symbol: 'security',
    name: 'Moderation',
    href: '/dashboard/moderation',
  },
  {
    symbol: 'chronic',
    name: 'Timers',
    href: '/dashboard/timers',
  },
  {
    symbol: 'database',
    name: 'Data',
    href: '/dashboard/data',
  },
  {
    symbol: 'quick_reference',
    name: 'Help',
    href: '/dashboard/help',
  },
  {
    symbol: 'settings',
    name: 'Settings',
    href: '/dashboard/settings',
  },
];

export default sidebarElements;
