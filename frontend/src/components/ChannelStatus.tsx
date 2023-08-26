import { createMemo, createResource, Show } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import Button from '#components/Button';
import { BotConnectionStatus, GetBotConnectionStatusResponse } from '#shared/types/api/dashboard';

import style from '#styles/ChannelStatus.module.scss';


const parseSymbol = (state: boolean | undefined) => {
  if (state === undefined) return 'question_mark';
  return state ? 'check' : 'close';
};

const fetchConnectionStatus = async (): Promise<BotConnectionStatus> => {
  const response = await fetch('/api/v1/dashboard/connection-status');
  const { data } = await response.json() as GetBotConnectionStatusResponse;

  return data;
};

const ChannelStatus: Component = () => {
  const [status, { refetch: refetchConnection }] = createResource(fetchConnectionStatus);

  const joinChannel = async (): Promise<void> => {
    const response = await fetch('/api/v1/dashboard/join-channel', {
      method: 'POST',
    });

    if (response.ok) {
      refetchConnection();
    }
  };

  const joinChannelContent = createMemo(() => {
    if (status()?.joined) return { symbol: 'logout', text: 'Leave Channel' };
    return { symbol: 'login', text: 'Join Channel' };
  });

  return (
    <Show when={status.state === 'ready' || status.state === 'refreshing'} >
      <div class={style.container}>
        <div class={style.botInfo}>
          <div class={style.info}>
            <span>Channel:</span>
            <span class={style.channelName}>#{status()?.channel}</span>
          </div>
          <div class={style.info}>
            <span>Joined:</span>
            <MaterialSymbol symbol={parseSymbol(status()?.joined)} color='primary' />
          </div>
          <div class={style.info}>
            <span>Admin:</span>
            <MaterialSymbol symbol={parseSymbol(status()?.admin)} color='primary' />
          </div>
        </div>

        <Button size='big' color='primary' symbol={joinChannelContent().symbol} onClick={joinChannel} >{joinChannelContent().text}</Button>
      </div>
    </Show>
  );
};

export default ChannelStatus;
