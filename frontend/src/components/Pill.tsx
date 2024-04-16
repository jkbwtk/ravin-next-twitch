import style from '#styles/Pill.module.scss';
import { JSX, Show } from 'solid-js';


export type PillProps = {
  content: string;
  icon?: JSX.Element;
  class?: string;
};

const Pill: Component<PillProps> = (props) => {
  return (
    <div class={[style.pill, props.class].join(' ')}>
      <Show when={props.icon}>
        {props.icon}
      </Show>

      {props.content}
    </div>
  );
};

export default Pill;
