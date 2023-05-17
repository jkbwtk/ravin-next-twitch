import { createResource, For, Match, Show, Switch } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { Link, useRouteData } from '@solidjs/router';
import { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import Button from '#components/Button';
import { BotConnectionStatus, GetBotConnectionStatusResponse } from '#shared/types/api/dashboard';

import style from '#styles/DashboardInfoBar.module.scss';
import borders from '#styles/borders.module.scss';


const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const parseSymbol = (state: boolean | undefined) => {
  if (state === undefined) return 'question_mark';
  return state ? 'check' : 'close';
};

const fetchConnectionStatus = async (): Promise<BotConnectionStatus> => {
  const response = await fetch('/api/v1/dashboard/connectionStatus');
  const { data } = await response.json() as GetBotConnectionStatusResponse;

  return data;
};

const DashboardInfoBar: Component = () => {
  const data = useRouteData<SidebarRoute>();
  const [status, { refetch: refetchConnection }] = createResource(fetchConnectionStatus, {
    initialValue: {
      channel: '[unknown]',
      joined: false,
      admin: false,
    },
  });

  const joinChannel = async (): Promise<void> => {
    const response = await fetch('/api/v1/dashboard/joinChannel', {
      method: 'POST',
    });

    if (response.ok) {
      refetchConnection();
    }
  };

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

        <Show when={!status.loading}>
          <div class={style.botInfo}>
            <div class={style.info}>
              <span>Channel:</span>
              <span class={style.channelName}>#{status().channel}</span>
            </div>
            <div class={style.info}>
              <span>Joined:</span>
              <MaterialSymbol symbol={parseSymbol(status().joined)} color='primary' />
            </div>
            <div class={style.info}>
              <span>Admin:</span>
              <MaterialSymbol symbol={parseSymbol(status().admin)} color='primary' />
            </div>
          </div>
          <Switch>
            <Match when={status().joined}>
              <Button size='big' color='primary' symbol='logout' onClick={joinChannel} >Leave Channel</Button>
            </Match>
            <Match when={!(status().joined)}>
              <Button size='big' color='primary' symbol='login' onClick={joinChannel} >Join Channel</Button>
            </Match>
          </Switch>
        </Show>
      </div>
    </div>
  );
};

export default DashboardInfoBar;

