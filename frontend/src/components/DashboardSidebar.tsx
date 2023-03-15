import { Component, createSignal, For, Show } from 'solid-js';

import style from '#styles/DashboardSidebar.module.scss';
import MaterialSymbol from '#components/MaterialSymbol';
import { Link, useBeforeLeave } from '@solidjs/router';


export interface SidebarElementProps {
  symbol: string;
  name: string;
  href: string;
  auxElements?: SidebarElementProps[];
}

export interface SidebarProps {
  elements: SidebarElementProps[];
}

const SidebarElement: Component<SidebarElementProps> = (props) => {
  const hasAuxElements = Array.isArray(props.auxElements) && props.auxElements.length !== 0;

  const elementBase = <>
    <MaterialSymbol symbol={props.symbol} />
    <span>{props.name}</span>
  </>;

  if (!hasAuxElements) {
    return (
      <Link
        href={props.href}
        class={style.element}
        activeClass={style.active}
        end={!hasAuxElements}
        draggable={false}
      >
        {elementBase}
      </Link>
    );
  }

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
      <button classList={{
        [style.active]: open(),
        [style.element]: true,
      }}
      onClick={(ev) => {
        console.log(ev.target);
        setOpen(!open());
      }}
      >
        {elementBase}
        <Show when={hasAuxElements}>
          <MaterialSymbol customClass={style.dropdownArrow} symbol='arrow_back_ios_new' size='small' />
        </Show>
      </button>

      <Show when={hasAuxElements && open()}>
        <nav class={style.subContainer}>
          <For each={props.auxElements}>
            {(element) => (<SidebarElement {...element} />)}
          </For>
        </nav>
      </Show>
    </div>
  );
};

const DashboardSidebar: Component<SidebarProps> = ({ elements }) => {
  return (
    <nav class={style.container}>
      <For each={elements}>
        {(element) => (<SidebarElement {...element} />)}
      </For>
    </nav>
  );
};

export default DashboardSidebar;
