import { createMemo, createResource, ErrorBoundary, For, InitializedResourceReturn, onCleanup, onMount, Show, Suspense } from 'solid-js';
import Widget from '#components/Widget';
import { Action, GetRecentActionsResponse } from '#types/api/dashboard';
import ActionSwitch from '#components/widgets/RecentActionsWidget/ActionSwitch';
import FetchFallback from '#components/FetchFallback';
import { useSocket } from '#providers/SocketProvider';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const fetchRecentActions = async (): Promise<Action[]> => {
  const { data } = await makeRequest('/api/v1/dashboard/widgets/recent-actions', { schema: GetRecentActionsResponse });

  return data;
};

const RecentActionsBase: Component<{ actions: InitializedResourceReturn<Action[]> }> = (props) => {
  const [actions, { mutate: mutateActions }] = props.actions;
  const [socket] = useSocket();


  const sortedActions = createMemo(() => actions().sort((a, b) => b.date - a.date));

  const pushAction = (action: Action) => {
    mutateActions((actions) => [...actions, action]);
  };

  onMount(() => {
    socket.client.on('NEW_RECENT_ACTION', pushAction);
  });

  onCleanup(() => {
    socket.client.off('NEW_RECENT_ACTION', pushAction);
  });

  return (
    <For each={sortedActions()}>
      {(action) => <ActionSwitch {...action} />}
    </For>
  );
};

const RecentActionsWidget: Component = () => {
  const resource = createResource(fetchRecentActions, {
    initialValue: [],
  });
  const [actions, { refetch: refetchActions }] = resource;

  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Recent actions'>
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchActions} loading={actions.state === 'refreshing'}>Failed to load recent actions</ErrorFallback>
      }>
        <Suspense fallback={<FetchFallback>Fetching Recent Actions</FetchFallback>}>
          <RecentActionsBase actions={resource} />
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default RecentActionsWidget;
