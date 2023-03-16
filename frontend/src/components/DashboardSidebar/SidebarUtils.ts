import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';


export const hasAuxRoutes = (props: SidebarRoute): boolean => Array.isArray(props.auxRoutes) && props.auxRoutes.length !== 0;
