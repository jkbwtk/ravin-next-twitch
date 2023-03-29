import style from '#styles/DotSpinner.module.scss';


export interface SpinnerProps {
  boundsWidth?: string;
  boundsHeight?: string;
}

const DotSpinner: Component<SpinnerProps> = (props) => {
  const aspectRatio = 1.83;

  const getSpinnerSize = (): string => {
    if (props.boundsWidth && props.boundsHeight) {
      return `min(calc(${props.boundsWidth} / ${aspectRatio}), ${props.boundsHeight})`;
    }

    if (props.boundsWidth) return `calc(${props.boundsWidth} / ${aspectRatio})`;
    if (props.boundsHeight) return props.boundsHeight;

    return '';
  };

  return (
    <div class={style.spinner} style={{
      'font-size': getSpinnerSize(),
    }}>
      <span class={style.spinnerBall} />
      <span class={style.spinnerBall} />
      <span class={style.spinnerBall} />
      <span class={style.spinnerBall} />
    </div>
  );
};

export default DotSpinner;
