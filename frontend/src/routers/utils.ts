import Redirect from '#pages/Redirect';
import { useSession } from '#providers/SessionProvider';
import { RouteDefinition, RouteLoadFunc } from '@solidjs/router';
import { lazy } from 'solid-js';


export type RouteMetadata = {
  name: string;
  symbol: string;
};

export type OptionalRouteMetadata = {
  metadata?: RouteMetadata;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtendedRouteDefinition<S extends string | string[] = any, T extends object = {}> =
  Omit<RouteDefinition<S, T & OptionalRouteMetadata>, 'children'> & {
    permissions?: {
      loggedIn?: boolean;
      adminOnly?: boolean;
    }
    children?: ExtendedRouteDefinition<S, T>[];
  } & OptionalRouteMetadata;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DynamicRouteDefinition<S extends string | string[] = any, T extends object = {}> = () => ExtendedRouteDefinition<S, T>[];

export const hasAuxRoutes = (route: ExtendedRouteDefinition): boolean => route.children !== undefined;

export const joinPaths = (base: string | undefined, path: string): string => {
  if (base === undefined) return path;

  const joined = `${base}/${path}`;

  return joined.replace(/\/$/, '');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteFilter<T extends ExtendedRouteDefinition<string, any>> = (route: T) => boolean;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recursiveRouteFilter = <T extends ExtendedRouteDefinition<string, any>>(routes: T[], filter: RouteFilter<T>): T[] => {
  const filteredRoutes: T[] = [];

  for (const route of routes) {
    if (filter(route)) {
      filteredRoutes.push({
        ...route,
        children: route.children ? recursiveRouteFilter(route.children as T[], filter) : undefined,
      });
    }
  }

  return filteredRoutes;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkPermissions = <T extends ExtendedRouteDefinition<string, any>>(routes: T[]): T[] => {
  const [session] = useSession();

  return recursiveRouteFilter(routes, (route) => {
    if (route.permissions === undefined) return true;

    if (route.permissions.loggedIn !== undefined && route.permissions.loggedIn !== session.loggedIn) return false;
    if (route.permissions.adminOnly && !session.user?.admin) return false;

    return true;
  });
};

const routeLoader = (route: ExtendedRouteDefinition): RouteLoadFunc => (args) => {
  if (!route.metadata) return route.load?.(args);
  if (route.load === undefined) return { metadata: route.metadata };

  return {
    metadata: route.metadata,
    ...(route.load?.(args)),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportRoutes = <T extends ExtendedRouteDefinition<string, any>>(routes: T[]): RouteDefinition[] => {
  const exportedRoutes: RouteDefinition[] = [];

  for (const route of routes) {
    const children = route.children ? exportRoutes(route.children) : undefined;

    if (children !== undefined && children.length > 0) {
      children.push({
        path: '',
        component: Redirect as Component,
        load: () => ({ to: children[0].path }),
      });
    }

    exportedRoutes.push({
      ...route,
      children,
      component: route.component ?? (hasAuxRoutes(route) ? undefined : lazy(() => import('#pages/dashboard/FeatureNotAvailable'))),
      load: routeLoader(route),
    });
  }

  return exportedRoutes;
};
