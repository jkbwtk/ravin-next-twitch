import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import Redirect from '#pages/Redirect';
import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';


export type SidebarRouteWithAuxRoutes = SidebarRoute & { auxRoutes: SidebarRoute[] };
export const hasAuxRoutes = (props: SidebarRoute): props is SidebarRouteWithAuxRoutes => Array.isArray(props.auxRoutes) && props.auxRoutes.length !== 0;

export const convertToRouteDefinitions = (parentPath: string, props: SidebarRoute[]): RouteDefinition[] => {
  const routes: RouteDefinition[] = [];

  for (const route of props) {
    const children = hasAuxRoutes(route) ? convertToRouteDefinitions(route.href, route.auxRoutes) : undefined;

    if (children !== undefined && children.length >= 1) {
      children.push({
        path: '',
        component: () => Redirect(route.href.concat(children[0].path)),
      });
    }

    routes.push({
      path: route.href.replace(parentPath, ''),
      component: route.component ?? (hasAuxRoutes(route) ? undefined : lazy(() => import('#pages/dashboard/FeatureNotAvailable'))),
      children,
      data: () => route,
    });
  }

  return routes;
};
