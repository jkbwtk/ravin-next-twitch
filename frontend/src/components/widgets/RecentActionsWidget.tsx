import { Component, createMemo, createResource, For } from 'solid-js';
import Widget from '#components/Widget';
import { Action, GetRecentActionsResponse } from '#types/api/dashboard';
import ActionSwitch from '#components/widgets/RecentActionsWidget/ActionSwitch';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const fetchRecentActions = async (): Promise<Action[]> => {
  const response = await fetch('/api/v1/dashboard/widgets/recentActions');
  const { data } = await response.json() as GetRecentActionsResponse;

  return data;
};

const RecentActionsWidget: Component = () => {
  const [actions] = createResource(fetchRecentActions, {
    initialValue: [],
  });

  const sortedActions = createMemo(() => actions().sort((a, b) => b.date - a.date));

  return (
    <Widget customClass={style.container} containerClass={style.outerContainer} title='Recent actions'>
      <For each={sortedActions()}>
        {(action) => (ActionSwitch(action))}
      </For>
    </Widget>
  );
};

export default RecentActionsWidget;
