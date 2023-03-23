import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';


export type SidebarRouteWithAuxRoutes = SidebarRoute & { auxRoutes: SidebarRoute[] };
export const hasAuxRoutes = (props: SidebarRoute): props is SidebarRouteWithAuxRoutes => Array.isArray(props.auxRoutes) && props.auxRoutes.length !== 0;

export const convertToRouteDefinitions = (parentPath: string, props: SidebarRoute[]): RouteDefinition[] => {
  const routes: RouteDefinition[] = [];

  for (const route of props) {
    routes.push({
      path: route.href.replace(parentPath, ''),
      component: route.component ?? lazy(() => import('#pages/dashboard/FeatureNotAvailable')),
      children: hasAuxRoutes(route) ? convertToRouteDefinitions(route.href, route.auxRoutes) : undefined,
      data: () => route,
    });
  }

  return routes;
};
