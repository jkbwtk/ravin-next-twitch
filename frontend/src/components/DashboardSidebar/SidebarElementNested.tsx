import SidebarElementBase, { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import SidebarElementSwitch from '#components/DashboardSidebar/SidebarElementSwitch';
import { hasAuxRoutes } from '#components/DashboardSidebar/SidebarUtils';
import MaterialSymbol from '#components/MaterialSymbol';
import { useBeforeLeave, useLocation } from '@solidjs/router';
import { createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';

import style from '#styles/DashboardSidebar.module.scss';


const SidebarElementNested: Component<SidebarRoute> = (props) => {
  const pathname = useLocation().pathname;
  const [open, setOpen] = createSignal(pathname.startsWith(props.href));

  let outerContainer = document.createElement('div');
  let innerContainer = document.createElement('nav');

  useBeforeLeave((ev) => {
    if (!ev.to.toString().startsWith(props.href)) setOpen(false);
  });

  createEffect<boolean>((runOnce) => {
    if (runOnce === undefined) {
      open(); // register dependency
      return true;
    }

    let height = innerContainer.scrollHeight;

    if (open()) {
      outerContainer.style.maxHeight = `${height}px`;
    } else {
      if (outerContainer.offsetHeight === height) {
        outerContainer.style.transition = 'none';
      }

      requestAnimationFrame(() => {
        outerContainer.style.maxHeight = `${height}px`;

        requestAnimationFrame(() => {
          outerContainer.style.removeProperty('transition');

          requestAnimationFrame(() => {
            outerContainer.style.removeProperty('max-height');
          });
        });
      });
    }

    return true;
  });

  const removeHeightVariable = (ev: TransitionEvent) => {
    if (ev.propertyName !== 'max-height') return;
    if (ev.target !== outerContainer) return;

    if (open()) {
      outerContainer.style.maxHeight = '100%';
    }
  };

  onMount(() => {
    outerContainer.addEventListener('transitionend', removeHeightVariable);

    if (open()) {
      outerContainer.style.maxHeight = '100%';
    }
  });

  onCleanup(() => {
    outerContainer.removeEventListener('transitionend', removeHeightVariable);
  });


  return (
    <div
      classList={{
        [style.dropdown]: true,
      }}
    >
      <button
        classList={{
          [style.nestedActive]: open(),
          [style.element]: true,
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <SidebarElementBase {...props} />
        <Show when={hasAuxRoutes(props)}>
          <MaterialSymbol class={style.dropdownArrow} symbol='arrow_back_ios_new' size='smallest' />
        </Show>
      </button>

      <Show when={hasAuxRoutes(props)}>
        <div
          ref={outerContainer}
          class={style.outerSubContainer}
        >
          <nav ref={innerContainer} class={style.subContainer}>
            <For each={props.auxRoutes}>
              {(element) => (<SidebarElementSwitch {...element} />)}
            </For>
          </nav>
        </div>
      </Show>
    </div>
  );
};

export default SidebarElementNested;
