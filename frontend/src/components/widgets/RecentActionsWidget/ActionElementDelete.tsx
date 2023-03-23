import { Component } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import ActionElementBase from '#components/widgets/RecentActionsWidget/ActionElementBase';
import { Action } from '#shared/types/api/dashboard';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const ActionDelete: Component<Action & { type: 'delete' }> = (props) => {
  return (
    <div class={style.entry}>
      <MaterialSymbol symbol='delete' color='primary' size='big' />
      <div class={style.content}>
        <ActionElementBase {...props} />

        <div class={style.description}>
          <span>Deleted message, Author:</span>
          <span class={style.value}>{props.targetDisplayName}</span>

          <div class={style.group}>
            <span>Message:</span>
            <span class={style.value}>{props.message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionDelete;
