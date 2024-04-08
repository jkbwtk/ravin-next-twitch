import { Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { dashboardRoutes } from '#routers/routes/dashboardRoutes';
import { DynamicRouteDefinition, exportRoutes } from '#routers/utils';

// bundle homepage and error pages with the main bundle
import Homepage from '#pages/Homepage';
import Error404 from '#pages/Error404';


const routes: DynamicRouteDefinition = () => [
  {
    path: '/',
    component: Homepage,
  },
  {
    path: '/dashboard',
    component: lazy(() => import('#pages/DashboardPage')),
    children: dashboardRoutes(),
  },
  {
    path: '/onboarding',
    component: lazy(() => import('#pages/Onboarding')),
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
    path: '**',
    component: Error404,
  },
];

const App: ParentComponent = (props) => {
  return props.children;
};

const AppRouter: Component = () => {
  return (
    <Router
      root={App}
      explicitLinks={true}
    >
      {exportRoutes(routes())}
    </Router>
  );
};

export default AppRouter;
