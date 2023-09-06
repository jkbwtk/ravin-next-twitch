import { JSX, mergeProps } from 'solid-js';
import CircleSpinner from '#components/CircleSpinner';

import style from '#styles/FetchFallback.module.scss';


export type FetchFallbackProps = JSX.HTMLAttributes<HTMLDivElement> & {
  spinner?: Component;
};

const defaultProps: Required<Pick<FetchFallbackProps, 'spinner'>> = {
  spinner: CircleSpinner,
};

const FetchFallback: ParentComponent<FetchFallbackProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <div class={[style.loading, props.class].join(' ')} {...props}>
      <props.spinner />
      <span>{props.children}</span>
    </div>
  );
};

export default FetchFallback;
