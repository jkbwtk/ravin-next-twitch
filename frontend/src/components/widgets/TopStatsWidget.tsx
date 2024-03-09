import { createResource, ErrorBoundary, Suspense } from 'solid-js';
import Widget from '#components/Widget';
import AnimatedImage from '#components/AnimatedImage';
import { GetTopStatsResponse, TopStats } from '#types/api/dashboard';
import MaterialSymbol from '#components/MaterialSymbol';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';
import { Skeleton, Stack } from '@suid/material';

import style from '#styles/widgets/TopStatsWidget.module.scss';


const fetchTopStats = async (): Promise<TopStats> => {
  const { data } = await makeRequest('/api/v1/dashboard/widgets/top-stats', { schema: GetTopStatsResponse });

  return data;
};

const TopStatsWidget: Component = () => {
  const [stats, { refetch: refetchStats }] = createResource(fetchTopStats, {
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
    <Widget class={style.container} title='Top Stats' refresh={refetchStats} loading={stats.state === 'refreshing'}>
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchStats} loading={stats.state === 'refreshing'}>Failed to load top stats</ErrorFallback>
      }>
        <Suspense fallback={
          <>
            <Stack class={style.segment}>
              <Skeleton variant='text' animation='wave' />
              <div class={style.entry}>
                <Skeleton variant='circular' animation='wave' width={40} height={40} />
                <Skeleton variant='text' animation='wave' style={{ 'flex-grow': 1 }} />
              </div>
            </Stack>

            <Stack class={style.segment}>
              <Skeleton variant='text' animation='wave' />
              <div class={style.entry}>
                <Skeleton variant='circular' animation='wave' width={40} height={40} />
                <Skeleton variant='text' animation='wave' style={{ 'flex-grow': 1 }} />
              </div>
            </Stack>

            <Stack class={style.segment}>
              <Skeleton variant='text' animation='wave' />
              <div class={style.entry}>
                <Skeleton variant='circular' animation='wave' width={40} height={40} />
                <Skeleton variant='text' animation='wave' style={{ 'flex-grow': 1 }} />
              </div>
            </Stack>
          </>
        }>
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
              <span class={style.name}>{stats().command}</span>
            </div>
          </div>

          <div class={style.segment}>
            <span class={style.segmentTitle}>Top emote</span>

            <div class={style.entry}>
              <AnimatedImage class={style.emote} src={stats().emote.url} />
              <span class={style.name}>{stats().emote.name}</span>
            </div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default TopStatsWidget;
