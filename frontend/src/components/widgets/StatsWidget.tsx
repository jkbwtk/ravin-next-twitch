import { createEffect, createResource, createSignal, onCleanup, onMount, Show } from 'solid-js';
import Chart from 'chart.js/auto';
import Widget from '#components/Widget';
import { ChatStats, GetChatStatsResponse } from '#types/api/dashboard';
import DotSpinner from '#components/DotSpinner';
import FetchFallback from '#components/FetchFallback';
import { timeframe } from '#shared/timeUtils';
import { truncateNumber } from '#shared/numberUtils';

import style from '#styles/widgets/StatsWidget.module.scss';


const fetchChatStats = async (): Promise<ChatStats> => {
  const response = await fetch('/api/v1/dashboard/widgets/chatStats');
  const { data } = await response.json() as GetChatStatsResponse;

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

const StatsWidget: Component<StatsWidgetProps> = (props) => {
  const [stats] = createResource(fetchChatStats);
  const [widgetVisible, setWidgetVisible] = createSignal(false);

  let chart: Chart;
  let canvasRef = document.createElement('canvas');
  let lastUpdate = 0;
  const delay = 1000;
  let updateHandle: number;

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
  });

  onCleanup(() => {
    window.removeEventListener('resize', resizeChart);
    watcher.disconnect();
  });

  createEffect(() => {
    if (stats.state !== 'ready') return;
    setWidgetVisible(true);

    if (chart === undefined) chart = createChart(canvasRef);


    chart.data.labels = stats().messages.map((row) => timeframe(row[0], row[0] + row[1]));
    chart.data.datasets[0].data = stats().messages.map((row) => row[2]);

    chart.update();
  });

  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Stats'>
      <Show
        when={stats.state === 'ready' || stats.state === 'refreshing'}
        fallback={<FetchFallback>Fetching Chat Stats</FetchFallback>}
      >
        <div class={style.statsContainer}>
          <span class={style.timeframe}>{timeframe(stats()?.dateStart ?? 0, stats()?.dateEnd ?? 0)}</span>

          <div class={style.stats}>
            <span class={style.name}>Messages</span>
            <span class={style.value}>{truncateNumber(stats()?.messagesTotal)}</span>

            <span class={style.name}>Timeouts</span>
            <span class={style.value}>{truncateNumber(stats()?.timeoutsTotal)}</span>

            <span class={style.name}>Bans</span>
            <span class={style.value}>{truncateNumber(stats()?.bansTotal)}</span>

            <span class={style.name}>Deleted</span>
            <span class={style.value}>{truncateNumber(stats()?.deletedTotal)}</span>

            <span class={style.name}>Commands</span>
            <span classList={{
              [style.value]: true,
              [style.primary]: true,
            }}>{truncateNumber(stats()?.commandsTotal)}</span>
          </div>
        </div>

        <div class={style.chartContainer}>
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
      </Show>
    </Widget>
  );
};

export default StatsWidget;
