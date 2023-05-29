import { createMemo, createResource, For, onCleanup, onMount, Show } from 'solid-js';
import Widget from '#components/Widget';
import { Action, GetRecentActionsResponse } from '#types/api/dashboard';
import ActionSwitch from '#components/widgets/RecentActionsWidget/ActionSwitch';
import FetchFallback from '#components/FetchFallback';
import { useSocket } from '#providers/SocketProvider';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const fetchRecentActions = async (): Promise<Action[]> => {
  const response = await fetch('/api/v1/dashboard/widgets/recentActions');
  const { data } = await response.json() as GetRecentActionsResponse;

  return data;
};

const RecentActionsWidget: Component = () => {
  const [socket] = useSocket();
  const [actions, { mutate }] = createResource(fetchRecentActions, {
    initialValue: [],
  });

  const sortedActions = createMemo(() => actions().sort((a, b) => b.date - a.date));

  const pushAction = (action: Action) => {
    mutate((actions) => [...actions, action]);
  };

  onMount(() => {
    socket.client.on('NEW_RECENT_ACTION', pushAction);
  });

  onCleanup(() => {
    socket.client.off('NEW_RECENT_ACTION', pushAction);
  });

  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Recent actions'>
      <Show when={!actions.loading} fallback={<FetchFallback>Fetching Recent Actions</FetchFallback>}>
        <For each={sortedActions()}>
          {(action) => (ActionSwitch(action))}
        </For>
      </Show>
    </Widget>
  );
};

export default RecentActionsWidget;
