import { For } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { A, useLocation } from '@solidjs/router';
import { RouteMetadata } from '#routers/utils';

import style from '#styles/DashboardInfoBar.module.scss';
import borders from '#styles/borders.module.scss';


export type DashboardInfoBarProps = {
  metadata?: RouteMetadata;
};

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const DashboardInfoBar: ParentComponent<DashboardInfoBarProps> = (props) => {
  const location = useLocation();

  let pathAccumulator = [''];

  return (
    <div classList={{
      [style.borderContainer]: true,
      [borders.border]: true,
      [borders.bottom]: true,
    }}>
      <div class={style.container}>
        <div class={style.locationInfo}>
          <div class={style.title}>{props.metadata?.name}</div>
          <div class={style.path}>
            <A href='/' class={style.pathElement}>
              <MaterialSymbol symbol='home' color='gray' interactive size='small' highlightColor='primary' />
            </A>

            <For each={location.pathname.split('/').slice(1)}>
              {(part) => {
                pathAccumulator.push(part);

                return (
                  <>
                    <MaterialSymbol symbol='arrow_forward_ios' color='primary' size='smallest' />
                    <A href={pathAccumulator.join('/')} class={style.pathElement}>{capitalize(part)}</A>
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

