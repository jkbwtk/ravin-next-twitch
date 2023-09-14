import { timeDiff } from '#shared/timeUtils';
import { ScheduledJob } from '#shared/types/api/admin';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { createEffect, createSignal, Match, Switch } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(LocalizedFormat);

import style from '#styles/ScheduledCronJob.module.scss';


export type ScheduledCronJobProps = {
  timer: number;
} & ScheduledJob;

const ScheduledCronJob: Component<ScheduledCronJobProps> = (props) => {
  const calculateNextRun = () => timeDiff(props.isRunning ? props.nextRun : null, true);
  const calculateLastRun = () => timeDiff(props.lastRun, true);

  const [lastRun, setLastRun] = createSignal(calculateLastRun());
  const [nextRun, setNextRun] = createSignal(calculateNextRun());

  createEffect(() => {
    props.timer;

    setLastRun(calculateLastRun());
    setNextRun(calculateNextRun());
  });


  return <div class={style.job}>
    <Switch>
      <Match when={props.isRunning}>
        <MaterialSymbol symbol='play_arrow' size='big' color='green' />
      </Match>
      <Match when={!props.isRunning}>
        <MaterialSymbol symbol='paused' size='big' color='gray' />
      </Match>
      <Match when={props.isStopped}>
        <MaterialSymbol symbol='error' size='big' color='red' />
      </Match>
    </Switch>


    <div>
      <span class={style.header}>
        <span class={style.name}>{props.originalName}</span>
      </span>

      <div class={style.property}>
        <span class={style.name}>Pattern:</span>
        <span class={style.value}>{props.cron}</span>
      </div>

      <div class={style.property}>
        <span class={style.name}>Next run:</span>
        <span class={style.value}>T{nextRun()}</span>
      </div>

      <div class={style.property}>
        <span class={style.name}>Last run:</span>
        <span class={style.value}>T{lastRun()}</span>
      </div>
    </div>
  </div>;
};

export default ScheduledCronJob;
