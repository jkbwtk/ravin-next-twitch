import { createResource, ErrorBoundary, For, Match, onCleanup, onMount, Suspense, Switch } from 'solid-js';
import Widget from '#components/Widget';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';
import { BehaviorProfilesStatus, GetBehaviorProfilesStatusResponse } from '#types/api/behaviorProfiles';
import Pill from '#components/Pill';
import { useSocket } from '#providers/SocketProvider';
import { timeDiff } from '#shared/timeUtils';
import MaterialSymbol from '#components/MaterialSymbol';

import style from '#styles/widgets/ProfileStatusWidget.module.scss';


const fetchProfilesStatus = async (): Promise<BehaviorProfilesStatus> => {
  const { data } = await makeRequest('/api/v1/behaviorProfiles/status', { schema: GetBehaviorProfilesStatusResponse });

  return data;
};

const ProfileStatusWidget: Component = () => {
  const [socket] = useSocket();

  const [status, { refetch: refetchStatus, mutate: mutateStatus }] = createResource(fetchProfilesStatus, {
    initialValue: {
      channelInformation: null,
      streamStatus: null,
      activeProfiles: [],
    },
  });

  const updateStatus = (newStatus: BehaviorProfilesStatus) => {
    mutateStatus({
      channelInformation: newStatus.channelInformation,
      streamStatus: newStatus.streamStatus,
      activeProfiles: newStatus.activeProfiles,
    });
  };

  onMount(() => {
    socket.client.on('UPD_BEHAVIOR_PROFILE_STATUS', updateStatus);
  });

  onCleanup(() => {
    socket.client.off('UPD_BEHAVIOR_PROFILE_STATUS', updateStatus);
  });

  return (
    <Widget
      title='Status'
      refresh={refetchStatus}
      loading={status.state === 'refreshing'}
      class={style.container}
      containerClass={style.outerContainer}
    >
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchStatus} loading={status.state === 'refreshing'}>
          Failed to load status of behavior profiles
        </ErrorFallback>
      }>
        <Suspense>
          <div class={style.channelInfo}>
            <span class={style.name}>Title:</span>
            <span class={style.value}>{status().channelInformation?.title}</span>

            <span class={style.name}>Game:</span>
            <span class={style.value}>{status().channelInformation?.game_name}</span>

            <span class={style.name}>Tags:</span>
            <span class={style.valueContainer}>
              <For each={status().channelInformation?.tags ?? []}>
                {(tag) => (
                  <Pill content={tag} />
                )}
              </For>
            </span>
          </div>

          <div class={style.streamInfo}>
            <span class={style.name}>Live:</span>
            <span class={style.valueContainer}>
              <Switch>
                <Match when={status().streamStatus !== null}>
                  <MaterialSymbol symbol='radio_button_checked' size='small' color='red' />
                </Match>
                <Match when={status().streamStatus === null}>
                  <MaterialSymbol symbol='paused' size='small' color='gray' />
                </Match>
              </Switch>
            </span>

            <span class={style.name}>Viewers:</span>
            <span class={style.value}>
              <code>
                {status().streamStatus?.viewer_count ?? 0}
              </code>
            </span>

            <span class={style.name}>Duration:</span>
            <span class={style.value}>
              <code>
                {timeDiff(status().streamStatus?.started_at, false)}
              </code>
            </span>
          </div>

          <div class={style.profileInfo}>
            <span class={style.name}>Active Profiles:</span>

            <div class={style.profiles}>
              <For each={status().activeProfiles}>
                {(profile) => (
                  <div class={style.profile}>
                    <span class={style.name}>{profile.name}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default ProfileStatusWidget;
