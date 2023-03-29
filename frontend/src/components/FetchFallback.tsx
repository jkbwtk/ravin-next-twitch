import { JSX } from 'solid-js';
import CircleSpinner from '#components/CircleSpinner';

import style from '#styles/FetchFallback.module.scss';


const FetchFallback: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div {...props} class={[style.loading, props.class].join(' ')}>
      <CircleSpinner />
      <span>{props.children}</span>
    </div>
  );
};

export default FetchFallback;
