import MaterialSymbol from '#components/MaterialSymbol';
import { Show } from 'solid-js';

import style from '#styles/Widget.module.scss';


export type WidgetProps = {
  title: string,
  containerClass?: string;
  class?: string,
} & ({
  refresh?: never;
  loading?: never;
} | {
  refresh: () => void;
  loading: boolean;
});

const Widget: ParentComponent<WidgetProps> = (props) => {
  const containerClasses = [style.container, props.containerClass].join(' ');
  const classes = [style.containerProper, props.class].join(' ');

  return (
    <div class={containerClasses}>
      <div class={style.titleBar}>
        <span class={style.title}>{props.title}</span>

        <Show when={props.refresh}>
          <button onClick={props.refresh} classList={{
            [style.refreshButton]: true,
            [style.loading]: props.loading,
          }}>
            <MaterialSymbol
              symbol='refresh'
              size='small'
              interactive
              highlightColor='primary'
            />
          </button>
        </Show>
      </div>

      <div class={classes}>
        {props.children}
      </div>
    </div>
  );
};

export default Widget;
