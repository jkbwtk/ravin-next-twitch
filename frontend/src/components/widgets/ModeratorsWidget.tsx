import { createMemo, createResource, For, Show } from 'solid-js';
import Widget from '#components/Widget';
import AnimatedImage from '#components/AnimatedImage';
import { GetModeratorsResponse, Moderator } from '#types/api/dashboard';
import FetchFallback from '#components/FetchFallback';

import style from '#styles/widgets/ModeratorsWidget.module.scss';


const ModeratorComponent = (props: Moderator) => (
  <div class={style.user}>
    <AnimatedImage class={style.userAvatar} src={props.avatarUrl} />
    <span class={style.userName}>{props.displayName}</span>
  </div>
);

const fetchModerators = async (): Promise<Moderator[]> => {
  const response = await fetch('/api/v1/dashboard/widgets/moderators');
  const { data } = await response.json() as GetModeratorsResponse;

  return data;
};

const ModeratorsWidget: Component = () => {
  const [moderators, { refetch: refetchModerators }] = createResource(fetchModerators, {
    initialValue: [],
  });

  const onlineModerators = createMemo(() => moderators().filter((moderator) => moderator.status));
  const offlineModerators = createMemo(() => moderators().filter((moderator) => !moderator.status));

  return (
    <Widget class={style.container} title='Moderators' refresh={refetchModerators} loading={moderators.state === 'refreshing'}>
      <Show when={!moderators.loading} fallback={<FetchFallback>Fetching Moderators</FetchFallback>}>
        <div class={style.segment}>
          <span class={style.segmentTitle}>Online {onlineModerators().length} / {moderators().length}</span>

          <For each={onlineModerators()}>
            {(moderator) => ModeratorComponent(moderator)}
          </For>
        </div>

        <div classList={{
          [style.segment]: true,
          [style.offline]: true,
        }}>
          <span class={style.segmentTitle}>Offline {offlineModerators().length} / {moderators().length}</span>

          <For each={offlineModerators()}>
            {(moderator) => (ModeratorComponent(moderator))}
          </For>
        </div>
      </Show>
    </Widget>
  );
};

export default ModeratorsWidget;
