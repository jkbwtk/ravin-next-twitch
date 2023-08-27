import { For } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { Link, useRouteData } from '@solidjs/router';
import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';

import style from '#styles/DashboardInfoBar.module.scss';
import borders from '#styles/borders.module.scss';


const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const DashboardInfoBar: ParentComponent = (props) => {
  const data = useRouteData<SidebarRoute>();
  let pathAccumulator = [''];

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
            <Link href='/' class={style.pathElement}>
              <MaterialSymbol symbol='home' color='gray' interactive size='small' highlightColor='primary' />
            </Link>

            <For each={data.href.split('/').slice(1)}>
              {(part) => {
                pathAccumulator.push(part);

                return (
                  <>
                    <MaterialSymbol symbol='arrow_forward_ios' color='primary' size='smallest' />
                    <Link href={pathAccumulator.join('/')} class={style.pathElement}>{capitalize(part)}</Link>
                  </>
                );
              }}
            </For>
          </div>
        </div>

        {props.children}
      </div>
    </div>
  );
};

export default DashboardInfoBar;

