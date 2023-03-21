import { Component, JSX } from 'solid-js';

import style from '#styles/Widget.module.scss';


export interface WidgetProps {
  title: string,
  customClass?: string,
  children?: JSX.Element;
}

const Widget: Component<WidgetProps> = (props) => {
  const classes = [style.containerProper, props.customClass].join(' ');

  return (
    <div class={style.container}>
      <span class={style.title}>{props.title}</span>

      <div class={classes}>
        {props.children}
      </div>
    </div>
  );
};

export default Widget;
