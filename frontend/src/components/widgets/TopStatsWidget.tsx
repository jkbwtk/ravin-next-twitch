import { createResource, Show } from 'solid-js';
import Widget from '#components/Widget';
import AnimatedImage from '#components/AnimatedImage';
import { GetTopStatsResponse, TopStats } from '#types/api/dashboard';
import MaterialSymbol from '#components/MaterialSymbol';
import FetchFallback from '#components/FetchFallback';

import style from '#styles/widgets/TopStatsWidget.module.scss';


const fetchTopStats = async (): Promise<TopStats> => {
  const response = await fetch('/api/v1/dashboard/widgets/topStats');
  const { data } = await response.json() as GetTopStatsResponse;

  return data;
};

const TopStatsWidget: Component = () => {
  const [stats] = createResource(fetchTopStats, {
    initialValue: {
      chatter: {
        avatarUrl: '',
        displayName: '',
      },
      command: '',
      emote: {
        url: '',
        name: '',
      },
    },
  });

  return (
    <Widget class={style.container} title='Moderators'>
      <Show when={!stats.loading} fallback={<FetchFallback>Fetching Top Stats</FetchFallback>}>

        <div class={style.segment}>
          <span class={style.segmentTitle}>Top chatter</span>

          <div class={style.entry}>
            <AnimatedImage class={style.userAvatar} src={stats().chatter.avatarUrl} />
            <span class={style.name}>{stats().chatter.displayName}</span>
          </div>
        </div>

        <div class={style.segment}>
          <span class={style.segmentTitle}>Top command</span>

          <div class={style.entry}>
            <MaterialSymbol symbol='military_tech' color='primary' size='big' />
            <span class={style.name}>!{stats().command}</span>
          </div>
        </div>

        <div class={style.segment}>
          <span class={style.segmentTitle}>Top emote</span>

          <div class={style.entry}>
            <AnimatedImage class={style.emote} src={stats().emote.url} />
            <span class={style.name}>{stats().emote.name}</span>
          </div>
        </div>
      </Show>
    </Widget>
  );
};

export default TopStatsWidget;
