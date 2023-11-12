import { createEffect, createMemo, createResource, createSignal, ErrorBoundary, onCleanup, onMount, ResourceReturn, Show, Suspense } from 'solid-js';
import Chart from 'chart.js/auto';
import Widget from '#components/Widget';
import { ChatStats, ChatStatSources, GetChatStatsResponse } from '#types/api/dashboard';
import DotSpinner from '#components/DotSpinner';
import FetchFallback from '#components/FetchFallback';
import { timeframe } from '#shared/timeUtils';
import { truncateNumber } from '#shared/numberUtils';
import { makeRequest } from '#lib/fetch';
import ErrorFallback from '#components/ErrorFallback';

import style from '#styles/widgets/StatsWidget.module.scss';


const fetchChatStats = async (): Promise<ChatStats> => {
  const { data } = await makeRequest('/api/v1/dashboard/widgets/chat-stats', { schema: GetChatStatsResponse });

  return data;
};

export interface StatsWidgetProps {
  containerRef: HTMLElement;
}

const createChart = (canvas: HTMLCanvasElement) => new Chart(
  canvas,
  {
    type: 'bar',
    options: {
      maintainAspectRatio: false,
      events: ['mousemove', 'mouseout'],
      interaction: {
        mode: 'index',
        intersect: false,
      },
      animations: {
        x: {
          type: 'number',
          easing: 'linear',
          duration: 0,
          properties: ['x', 'width'],
        },
        y: {
          type: 'number',
          easing: 'easeInOutCubic',
          duration: 500,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#101010AA',
          padding: 10,
          cornerRadius: 10,
          titleAlign: 'center',
          titleFont: {
            family: 'Quicksand',
            weight: '700',
            size: 12,
          },
          bodyFont: {
            family: 'Quicksand',
            weight: '500',
            size: 16,
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          position: 'right',
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      datasets: [
        {
          label: 'Messages',
          data: [],
          borderRadius: 9001,
          backgroundColor: '#A62130',
          hoverBackgroundColor: '#DF2137',
          borderWidth: 0,
        },
      ],
    },
  },
);

const StatsBase: Component<StatsWidgetProps & { stats: ResourceReturn<ChatStats> }> = (props) => {
  const [stats, { refetch: refetchStats }] = props.stats;
  const [widgetVisible, setWidgetVisible] = createSignal(false);
  const [selectedStat, setSelectedStat] = createSignal<ChatStatSources>('messages');

  let chart: Chart;
  let canvasRef = document.createElement('canvas');
  let lastUpdate = 0;
  const delay = 1000;
  let updateHandle: number;
  let fetchTimer: number | undefined;

  const labelsMemo = createMemo(() => stats()?.frames.map((frame) => timeframe(frame.timestamp, frame.timestamp + frame.frameDuration)));

  const resizeChart = () => {
    setWidgetVisible(false);

    if (Date.now() - lastUpdate < delay) return;
    lastUpdate = Date.now();

    clearTimeout(updateHandle);

    updateHandle = setTimeout(() => {
      if (chart) setWidgetVisible(true);
    }, delay * 1.2) as unknown as number;
  };

  const watcher = new ResizeObserver(resizeChart);

  onMount(() => {
    window.addEventListener('resize', resizeChart);

    const watcher = new ResizeObserver(resizeChart);
    watcher.observe(props.containerRef);

    if (fetchTimer !== undefined) clearInterval(fetchTimer);
    fetchTimer = setInterval(() => {
      refetchStats();
    }, 1000 * 60 * 1) as unknown as number;
  });

  onCleanup(() => {
    window.removeEventListener('resize', resizeChart);
    watcher.disconnect();

    if (fetchTimer !== undefined) clearInterval(fetchTimer);
  });

  createEffect(() => {
    if (stats.state !== 'ready') return;
    setWidgetVisible(true);

    if (chart === undefined) chart = createChart(canvasRef);

    chart.data.labels = labelsMemo();
    chart.data.datasets[0].label = selectedStat().charAt(0).toUpperCase() + selectedStat().slice(1);

    switch (selectedStat()) {
      case 'messages':
        chart.data.datasets[0].data = stats().frames.map((frame) => frame.messages);
        break;
      case 'timeouts':
        chart.data.datasets[0].data = stats().frames.map((frame) => frame.timeouts);
        break;
      case 'bans':
        chart.data.datasets[0].data = stats().frames.map((frame) => frame.bans);
        break;
      case 'deleted':
        chart.data.datasets[0].data = stats().frames.map((frame) => frame.deleted);
        break;
      case 'commands':
        chart.data.datasets[0].data = stats().frames.map((frame) => frame.commands);
        break;

      default:
        break;
    }

    chart.update();
  });

  return (
    <>
      <div class={style.statsContainer}>
        <span class={style.timeframe}>{timeframe(stats()?.dateStart ?? 0, stats()?.dateEnd ?? 0)}</span>

        <div class={style.stats}>
          <span class={style.name}>Messages</span>
          <button
            classList={{
              [style.value]: true,
              [style.primary]: selectedStat() === 'messages',
            }}
            onClick={() => setSelectedStat('messages')}
          >{truncateNumber(stats()?.messagesTotal)}</button>

          <span class={style.name}>Timeouts</span>
          <button
            classList={{
              [style.value]: true,
              [style.primary]: selectedStat() === 'timeouts',
            }}
            onClick={() => setSelectedStat('timeouts')}
          >{truncateNumber(stats()?.timeoutsTotal)}</button>

          <span class={style.name}>Bans</span>
          <button
            classList={{
              [style.value]: true,
              [style.primary]: selectedStat() === 'bans',
            }}
            onClick={() => setSelectedStat('bans')}
          >{truncateNumber(stats()?.bansTotal)}</button>

          <span class={style.name}>Deleted</span>
          <button
            classList={{
              [style.value]: true,
              [style.primary]: selectedStat() === 'deleted',
            }}
            onClick={() => setSelectedStat('deleted')}
          >{truncateNumber(stats()?.deletedTotal)}</button>

          <span class={style.name}>Commands</span>
          <button
            classList={{
              [style.value]: true,
              [style.primary]: selectedStat() === 'commands',
            }}
            onClick={() => setSelectedStat('commands')}
          >{truncateNumber(stats()?.commandsTotal)}</button>
        </div>
      </div><div class={style.chartContainer}>
        <Show when={!widgetVisible()}>
          <div class={style.chartResizeInfo}>
            <DotSpinner />
            <span>Resizing chart</span>
          </div>
        </Show>
        <canvas class={style.chart} ref={canvasRef} style={{
          display: widgetVisible() ? 'initial' : 'none',
        }} />
      </div>
    </>
  );
};

const StatsWidget: Component<StatsWidgetProps> = (props) => {
  const resource = createResource(fetchChatStats);
  const [stats, { refetch: refetchStats }] = resource;

  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Stats'>
      <ErrorBoundary fallback={
        <ErrorFallback class={style.fallback} refresh={refetchStats} loading={stats.state === 'refreshing'}>Failed to load chat stats</ErrorFallback>
      }>
        <Suspense fallback={<FetchFallback>Fetching Chat Stats</FetchFallback>}>
          <StatsBase {...props} stats={resource} />
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default StatsWidget;
