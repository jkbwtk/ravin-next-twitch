import { For, Show } from 'solid-js';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import { useSession } from '#providers/SessionProvider';

import style from '#styles/DashboardSidebar.module.scss';


export interface SidebarProps {
  elements: SidebarRoute[];
}

const DashboardSidebar: Component<SidebarProps> = ({ elements }) => {
  const [session] = useSession();

  return (
    <nav class={style.container}>
      <For each={elements}>
        {(element) => (
          <Show when={(element.adminOnly && session.user?.admin) || !element.adminOnly}>
            <SidebarElementSwitch {...element} />
          </Show>
        )}
      </For>
    </nav>
  );
};

export default DashboardSidebar;
