import { createResource, ErrorBoundary, For, onCleanup, onMount, Suspense } from 'solid-js';
import { useSocket } from '#providers/SocketProvider';
import Widget from '#components/Widget';
import { GetMessagesResponse, Message as MessagePublic } from '#shared/types/api/logs';
import { makeRequest } from '#lib/fetch';

import style from '#styles/widgets/LogsWidget.module.scss';
import ErrorFallback from '#components/ErrorFallback';
import FetchFallback from '#components/FetchFallback';


export type MessageProps = {
  message: MessagePublic;
};

const fetchMessages = async () => {
  const { data } = await makeRequest('/api/v1/logs/messages', { schema: GetMessagesResponse });

  return data;
};

const LogsWidget: Component = () => {
  const [socket] = useSocket();
  const [messages, { mutate: setMessages, refetch: refetchMessages }] = createResource(fetchMessages, {
    initialValue: [],
  });

  let tableRef = document.createElement('table');

  const createMessage = (message: MessagePublic) => {
    setMessages((m) => [message, ...m.slice(0, 999)]);
  };

  onMount(() => {
    socket.client.on('NEW_MESSAGE', createMessage);
  });

  onCleanup(() => {
    socket.client.off('NEW_MESSAGE', createMessage);
  });

  return (
    <Widget
      title='Chat Logs'
      class={style.container}
      containerClass={style.outerContainer}
      refresh={refetchMessages}
      loading={messages.state === 'refreshing'}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchMessages} loading={messages.state === 'refreshing'}>Failed to load logs</ErrorFallback>
      }>
        <Suspense fallback={<FetchFallback class={style.fallback}>Fetching Logs</FetchFallback>}>
          <table ref={tableRef} class={style.commandsContainer}>
            <colgroup>
              <col />
              <col />
              <col />
            </colgroup>

            <thead>
              <tr>
                <th>User</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <For each={messages()}>
                {(message) => (
                  <tr>
                    <td>{message.displayName}</td>
                    <td>{message.content}</td>
                    <td>{new Date(message.timestamp).toDateString()}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default LogsWidget;
