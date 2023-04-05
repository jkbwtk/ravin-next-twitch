import { JSX } from 'solid-js';

import style from '#styles/CircleSpinner.module.scss';


const CircleSpinner: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div class={[style.spinner, props.class].join(' ')} {...props} />
  );
};

export default CircleSpinner;
