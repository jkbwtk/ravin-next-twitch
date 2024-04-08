import { SidebarElementProps } from '#components/DashboardSidebar/SidebarElementBase';
import SidebarElementNested from '#components/DashboardSidebar/SidebarElementNested';
import SidebarElementSimple from '#components/DashboardSidebar/SidebarElementSimple';
import { hasAuxRoutes } from '#routers/utils';
import { Match, Switch } from 'solid-js';


const SidebarElementSwitch: Component<SidebarElementProps> = (props) => {
  return (
    <Switch>
      <Match when={hasAuxRoutes(props)}>
        <SidebarElementNested {...props} />
      </Match>
      <Match when={!hasAuxRoutes(props)}>
        <SidebarElementSimple {...props} />
      </Match>
    </Switch>
  );
};

export default SidebarElementSwitch;
