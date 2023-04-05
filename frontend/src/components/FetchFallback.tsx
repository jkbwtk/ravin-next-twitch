import { JSX } from 'solid-js';
import CircleSpinner from '#components/CircleSpinner';

import style from '#styles/FetchFallback.module.scss';


const FetchFallback: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div class={[style.loading, props.class].join(' ')} {...props} >
      <CircleSpinner />
      <span>{props.children}</span>
    </div>
  );
};

export default FetchFallback;
