import { For } from 'solid-js';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';

import style from '#styles/DashboardSidebar.module.scss';


export interface SidebarProps {
  elements: SidebarRoute[];
}

const DashboardSidebar: Component<SidebarProps> = ({ elements }) => {
  return (
    <nav class={style.container}>
      <For each={elements}>
        {(element) => (<SidebarElementSwitch {...element} />)}
      </For>
    </nav>
  );
};

export default DashboardSidebar;
