import { JSX } from 'solid-js';
import Button from '#components/Button';

import style from '#styles/ErrorFallback.module.scss';


export type ErrorFallbackProps = JSX.HTMLAttributes<HTMLDivElement> & {
  refresh: () => void;
  loading: boolean;
};

const ErrorFallback: ParentComponent<ErrorFallbackProps> = (props) => {
  return (
    <div {...props} class={[style.error, props.class].join(' ')}>
      <span>{props.children}</span>
      <Button onClick={props.refresh} symbol='Refresh' loading={props.loading} color='primary'>Retry</Button>
    </div>
  );
};

export default ErrorFallback;
