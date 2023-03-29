import MaterialSymbol from '#components/MaterialSymbol';
import ActionElementBase from '#components/widgets/RecentActionsWidget/ActionElementBase';
import { Action } from '#shared/types/api/dashboard';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


const ActionBan: Component<Action & { type: 'ban' }> = (props) => {
  return (
    <div class={style.entry}>
      <MaterialSymbol symbol='dangerous' color='primary' size='big' />
      <div class={style.content}>
        <ActionElementBase {...props} />

        <div class={style.description}>
          <span>Banned user</span>
          <span class={style.value}>{props.targetDisplayName}</span>

          <div class={style.group}>
            <span>Reason:</span>
            <span class={style.value}>{props.reason}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionBan;
