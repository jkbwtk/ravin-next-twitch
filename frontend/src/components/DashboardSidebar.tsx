import { For } from 'solid-js';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { SidebarElementProps } from '#components/DashboardSidebar/SidebarElementBase';

import style from '#styles/DashboardSidebar.module.scss';


export interface SidebarProps {
  elements: SidebarElementProps[];
}

const DashboardSidebar: Component<SidebarProps> = ({ elements }) => {
  return (
    <nav class={style.container}>
      <For each={elements}>
        {(element) => (
          <SidebarElementSwitch {...element} absolutePath='/dashboard' />
        )}
      </For>
    </nav>
  );
};

export default DashboardSidebar;
