import { Component, JSX } from 'solid-js';

import style from '#styles/Widget.module.scss';


export interface WidgetProps {
  title: string,
  containerClass?: string;
  customClass?: string,
  children?: JSX.Element;
}

const Widget: Component<WidgetProps> = (props) => {
  const containerClasses = [style.container, props.containerClass].join(' ');
  const classes = [style.containerProper, props.customClass].join(' ');

  return (
    <div class={containerClasses}>
      <span class={style.title}>{props.title}</span>

      <div class={classes}>
        {props.children}
      </div>
    </div>
  );
};

export default Widget;
