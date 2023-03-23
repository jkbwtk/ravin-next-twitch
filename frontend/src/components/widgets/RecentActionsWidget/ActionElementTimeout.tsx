import { Component } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import ActionElementBase from '#components/widgets/RecentActionsWidget/ActionElementBase';
import { Action } from '#shared/types/api/dashboard';
import { timeDuration } from '#shared/timeUtils';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const ActionTimeout: Component<Action & { type: 'timeout' }> = (props) => {
  return (
    <div class={style.entry}>
      <MaterialSymbol symbol='schedule' color='primary' size='big' />
      <div class={style.content}>
        <ActionElementBase {...props} />

        <div class={style.description}>
          <span>Timed out user</span>
          <span class={style.value}>{props.targetDisplayName}</span>

          <div class={style.group}>
            <span>Duration:</span>
            <span class={style.value}>{timeDuration(props.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionTimeout;
