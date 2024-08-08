
import { timeFromNow } from '#shared/timeUtils';
import { ChannelActionApi } from '#types/api/dashboard';

import style from '#styles/widgets/RecentActionsWidget.module.scss';


export type ActionElementInfoProps = Pick<ChannelActionApi, 'date' | 'issuerDisplayName'>;

const ActionElementBase: Component<ActionElementInfoProps> = ({ date, issuerDisplayName }) => {
  return (
    <div class={style.info}>
      <span class={style.time}>{timeFromNow(date)},</span>
      <span class={style.user}>{issuerDisplayName}</span>
    </div>
  );
};

export default ActionElementBase;
