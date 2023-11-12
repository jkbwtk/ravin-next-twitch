import { createResource, ErrorBoundary, Suspense } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import Button from '#components/Button';
import { BotConnectionStatus, GetBotConnectionStatusResponse } from '#shared/types/api/dashboard';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';

import style from '#styles/ChannelStatus.module.scss';


const parseSymbol = (state: boolean | undefined) => {
  if (state === undefined) return 'question_mark';
  return state ? 'check' : 'close';
};

const fetchConnectionStatus = async (): Promise<BotConnectionStatus> => {
  const { data } = await makeRequest('/api/v1/dashboard/connection-status', { schema: GetBotConnectionStatusResponse });

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

  return (
    <ErrorBoundary fallback={
      <ErrorFallback
        refresh={refetchConnection}
        loading={status.state === 'refreshing'}
        horizontal
      >
        Failed to load channel status
      </ErrorFallback>
    }>
      <Suspense>
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

          <Button
            size='big'
            color='primary'
            symbol={status()?.joined ? 'logout' : 'login'}
            onClick={joinChannel}
          >
            {status()?.joined ? 'Leave Channel' : 'Join Channel'}
          </Button>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ChannelStatus;
