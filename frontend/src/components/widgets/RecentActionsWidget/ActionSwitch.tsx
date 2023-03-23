import { Component, Match, Switch } from 'solid-js';
import { Action } from '#shared/types/api/dashboard';
import ActionBan from '#components/widgets/RecentActionsWidget/ActionElementBan';
import ActionTimeout from '#components/widgets/RecentActionsWidget/ActionElementTimeout';
import ActionDelete from '#components/widgets/RecentActionsWidget/ActionElementDelete';


const ActionSwitch: Component<Action> = (props) => {
  return (
    <Switch>
      <Match when={props.type === 'ban'}>
        <ActionBan {...props as Action & { type: 'ban' }} />
      </Match>
      <Match when={props.type === 'timeout'}>
        <ActionTimeout {...props as Action & { type: 'timeout' }} />
      </Match>
      <Match when={props.type === 'delete'}>
        <ActionDelete {...props as Action & { type: 'delete' }} />
      </Match>
    </Switch>
  );
};

export default ActionSwitch;
