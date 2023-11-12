import { createMemo, createResource, ErrorBoundary, For, InitializedResourceReturn, Suspense } from 'solid-js';
import Widget from '#components/Widget';
import AnimatedImage from '#components/AnimatedImage';
import { GetModeratorsResponse, Moderator } from '#types/api/dashboard';
import FetchFallback from '#components/FetchFallback';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';

import style from '#styles/widgets/ModeratorsWidget.module.scss';


const fetchModerators = async (): Promise<Moderator[]> => {
  const { data } = await makeRequest('/api/v1/dashboard/widgets/moderators', { schema: GetModeratorsResponse });

  return data;
};

const ModeratorComponent = (props: Moderator) => (
  <div class={style.user}>
    <AnimatedImage class={style.userAvatar} src={props.avatarUrl} />
    <span class={style.userName}>{props.displayName}</span>
  </div>
);

const ModeratorsBase: Component<{ moderators: InitializedResourceReturn<Moderator[]> }> = (props) => {
  const [moderators] = props.moderators;

  const onlineModerators = createMemo(() => moderators().filter((moderator) => moderator.status));
  const offlineModerators = createMemo(() => moderators().filter((moderator) => !moderator.status));

  return (
    <>
      <div class={style.segment}>
        <span class={style.segmentTitle}>Online {onlineModerators().length} / {moderators().length}</span>

        <For each={onlineModerators()}>
          {(moderator) => ModeratorComponent(moderator)}
        </For>
      </div><div classList={{
        [style.segment]: true,
        [style.offline]: true,
      }}>
        <span class={style.segmentTitle}>Offline {offlineModerators().length} / {moderators().length}</span>

        <For each={offlineModerators()}>
          {(moderator) => (ModeratorComponent(moderator))}
        </For>
      </div>
    </>
  );
};

const ModeratorsWidget: Component = () => {
  const resource = createResource(fetchModerators, {
    initialValue: [],
  });
  const [moderators, { refetch: refetchModerators }] = resource;

  return (
    <Widget class={style.container} title='Moderators' refresh={refetchModerators} loading={moderators.state === 'refreshing'}>
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchModerators} loading={moderators.state === 'refreshing'}>Failed to load moderators</ErrorFallback>
      }>
        <Suspense fallback={<FetchFallback>Fetching Moderators</FetchFallback>}>
          <ModeratorsBase moderators={resource}/>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default ModeratorsWidget;
