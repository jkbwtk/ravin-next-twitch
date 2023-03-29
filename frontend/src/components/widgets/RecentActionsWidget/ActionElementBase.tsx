
import { timeFromNow } from '#shared/timeUtils';
import { Action } from '#shared/types/api/dashboard';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


export type ActionElementInfoProps = Pick<Action, 'date' | 'issuerDisplayName'>;

const ActionElementBase: Component<ActionElementInfoProps> = ({ date, issuerDisplayName }) => {
  return (
    <div class={style.info}>
      <span class={style.time}>{timeFromNow(date)},</span>
      <span class={style.user}>{issuerDisplayName}</span>
    </div>
  );
};

export default ActionElementBase;
