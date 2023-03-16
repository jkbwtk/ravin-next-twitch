import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import { RouteDefinition } from '@solidjs/router';


export type SidebarRouteWithAuxRoutes = SidebarRoute & { auxRoutes: SidebarRoute[] };
export const hasAuxRoutes = (props: SidebarRoute): props is SidebarRouteWithAuxRoutes => Array.isArray(props.auxRoutes) && props.auxRoutes.length !== 0;

export const convertToRouteDefinitions = (parentPath: string, props: SidebarRoute[]): RouteDefinition[] => {
  const routes: RouteDefinition[] = [];

  for (const route of props) {
    routes.push({
      path: route.href.replace(parentPath, ''),
      component: route.component,
      children: hasAuxRoutes(route) ? convertToRouteDefinitions(route.href, route.auxRoutes) : undefined,
    });
  }

  return routes;
};
