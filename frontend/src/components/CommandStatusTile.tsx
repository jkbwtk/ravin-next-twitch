import MaterialSymbol from '#components/MaterialSymbol';
import { timeFromNowAlt } from '#shared/timeUtils';
import { CommandStatus } from '#shared/types/api/commands';
import { createEffect, createSignal, Match, onCleanup, onMount, Switch } from 'solid-js';

import style from '#styles/CommandStatusTile.module.scss';


const CommandStatusTile: Component<CommandStatus> = (props) => {
  const getTime = () => props.lastUsed !== 0 ? timeFromNowAlt(props.lastUsed) : 'never';
  const [time, setTime] = createSignal(getTime());
  let intervalHandle: number | undefined = undefined;
  let progressBarRef = document.createElement('div');

  const recalculateTime = () => {
    setTime(getTime());
  };

  const timeLeftUntilNextUse = () => Math.max(0, props.lastUsed + props.command.cooldown * 1000 - Date.now()) / 1000;
  const timePercentage = () => props.command.cooldown === 0 ? 0 : timeLeftUntilNextUse() / props.command.cooldown * 100;

  onMount(() => {
    intervalHandle = setInterval(recalculateTime, 1000) as unknown as number;
  });

  onCleanup(() => {
    if (intervalHandle) {
      clearInterval(intervalHandle);
    }
  });

  createEffect(() => {
    progressBarRef.style.width = timePercentage() + '%';
    progressBarRef.style.setProperty('--timeLeft', timeLeftUntilNextUse() + 's');

    // Wait 2 frames to start the animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBarRef.style.width = '0%';
      });
    });
  });

  return (
    <div class={style.container}>
      <div class={style.line}>
        <span class={style.name}>Command:</span>
        <span class={style.value}>{props.command.command}</span>
      </div>

      <div class={style.line}>
        <span class={style.name}>Enabled:</span>
        <Switch>
          <Match when={props.command.enabled}>
            <MaterialSymbol symbol='check' size='small' color='green' />
          </Match>
          <Match when={!props.command.enabled}>
            <MaterialSymbol symbol='close' size='small' color='red' />
          </Match>
        </Switch>
      </div>

      <div class={style.line}>
        <span class={style.name}>Last used:</span>
        <span class={style.value}>{time()}</span>
      </div>

      <div class={style.line}>
        <span class={style.name}>Cooldown:</span>
        <span class={style.value}>{props.command.cooldown}s</span>
      </div>

      <div class={style.line}>
        <span class={style.name}>Last used by:</span>
        <span class={style.value}>{props.lastUsedBy ?? 'No one'}</span>
      </div>

      <div ref={progressBarRef} class={style.progressBar} />
    </div>
  );
};

export default CommandStatusTile;
