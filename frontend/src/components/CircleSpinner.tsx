import { Component, JSX } from 'solid-js';

import style from '#styles/CircleSpinner.module.scss';


const CircleSpinner: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div {...props} class={[style.spinner, props.class].join(' ')} />
  );
};

export default CircleSpinner;
