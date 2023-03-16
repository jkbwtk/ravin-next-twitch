import SidebarElementBase, { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { hasAuxRoutes } from '#components/DashboardSidebar/SidebarUtils';
import MaterialSymbol from '#components/MaterialSymbol';
import { useBeforeLeave } from '@solidjs/router';
import { Component, createSignal, For, Show } from 'solid-js';

import style from '#styles/DashboardSidebar.module.scss';


const SidebarElementNested: Component<SidebarRoute> = (props) => {
  const [open, setOpen] = createSignal(false);

  useBeforeLeave((ev) => {
    if (!ev.to.toString().includes(props.href)) setOpen(false);
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
        onClick={() => setOpen(!open())}
      >
        <SidebarElementBase {...props} />
        <Show when={hasAuxRoutes(props)}>
          <MaterialSymbol customClass={style.dropdownArrow} symbol='arrow_back_ios_new' size='small' />
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
