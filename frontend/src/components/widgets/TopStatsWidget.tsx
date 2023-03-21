import { Component, createResource } from 'solid-js';
import Widget from '#components/Widget';
import AnimatedImage from '#components/AnimatedImage';
import { GetTopStatsResponse, TopStats } from '#types/api/dashboard';

import style from '#styles/widgets/TopStatsWidget.module.scss';
import MaterialSymbol from '#components/MaterialSymbol';


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
    <Widget customClass={style.container} title='Moderators'>
      <div class={style.segment}>
        <span class={style.segmentTitle}>Top chatter</span>

        <div class={style.entry}>
          <AnimatedImage class={style.icon} src={stats().chatter.avatarUrl} />
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
          <AnimatedImage class={style.icon} src={stats().emote.url} />
          <span class={style.name}>{stats().emote.name}</span>
        </div>
      </div>
    </Widget>
  );
};

export default TopStatsWidget;
