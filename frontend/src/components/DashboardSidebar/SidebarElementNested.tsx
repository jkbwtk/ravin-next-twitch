import SidebarElementBase, { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { hasAuxRoutes } from '#components/DashboardSidebar/SidebarUtils';
import MaterialSymbol from '#components/MaterialSymbol';
import { useBeforeLeave, useLocation } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';

import style from '#styles/DashboardSidebar.module.scss';


const SidebarElementNested: Component<SidebarRoute> = (props) => {
  const pathname = useLocation().pathname;
  const [open, setOpen] = createSignal(pathname.startsWith(props.href));

  useBeforeLeave((ev) => {
    if (!ev.to.toString().startsWith(props.href)) setOpen(false);
  });

  return (
    <div
      classList={{
        [style.dropdown]: true,
      }}
    >
      <button
        classList={{
          [style.active]: open(),
          [style.element]: true,
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <SidebarElementBase {...props} />
        <Show when={hasAuxRoutes(props)}>
          <MaterialSymbol class={style.dropdownArrow} symbol='arrow_back_ios_new' size='small' />
        </Show>
      </button>

      <Show when={hasAuxRoutes(props) && open()}>
        <nav class={style.subContainer}>
          <For each={props.auxRoutes}>
            {(element) => (<SidebarElementSwitch {...element} />)}
          </For>
        </nav>
      </Show>
    </div>
  );
};

export default SidebarElementNested;
