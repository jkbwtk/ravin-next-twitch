import { Match, Switch } from 'solid-js';
import { ChannelActionApi } from '#types/api/dashboard';
import ActionBan from '#components/widgets/RecentActionsWidget/ActionElementBan';
import ActionTimeout from '#components/widgets/RecentActionsWidget/ActionElementTimeout';
import ActionDelete from '#components/widgets/RecentActionsWidget/ActionElementDelete';


const ActionSwitch: Component<ChannelActionApi> = (props) => {
  return (
    <Switch>
      <Match when={props.type === 'ban'}>
        <ActionBan {...props as ChannelActionApi & { type: 'ban' }} />
      </Match>
      <Match when={props.type === 'timeout'}>
        <ActionTimeout {...props as ChannelActionApi & { type: 'timeout' }} />
      </Match>
      <Match when={props.type === 'delete'}>
        <ActionDelete {...props as ChannelActionApi & { type: 'delete' }} />
      </Match>
    </Switch>
  );
};

export default ActionSwitch;
