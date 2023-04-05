import style from '#styles/Widget.module.scss';


export interface WidgetProps {
  title: string,
  containerClass?: string;
  class?: string,
}

const Widget: ParentComponent<WidgetProps> = (props) => {
  const containerClasses = [style.container, props.containerClass].join(' ');
  const classes = [style.containerProper, props.class].join(' ');

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
