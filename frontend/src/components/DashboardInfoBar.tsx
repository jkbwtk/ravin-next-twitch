import { For } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { Link, useRouteData } from '@solidjs/router';
import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';

import style from '#styles/DashboardInfoBar.module.scss';
import borders from '#styles/borders.module.scss';


const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const DashboardInfoBar: ParentComponent = (props) => {
  const data = useRouteData<SidebarRoute>();

  return (
    <div classList={{
      [style.borderContainer]: true,
      [borders.border]: true,
      [borders.bottom]: true,
    }}>
      <div class={style.container}>
        <div class={style.locationInfo}>
          <div class={style.title}>{data.name}</div>
          <div class={style.path}>
            <Link href='/' class={style.pathElement}>Home</Link>
            <For each={data.href.split('/').slice(1)}>
              {(linkName) => (
                <>
                  <MaterialSymbol symbol='arrow_forward_ios' color='primary' size='small' />
                  <span class={style.pathElement}>{capitalize(linkName)}</span>
                </>
              )}
            </For>
          </div>
        </div>

        {props.children}
      </div>
    </div>
  );
};

export default DashboardInfoBar;

