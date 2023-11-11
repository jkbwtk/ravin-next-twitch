import { JSX, mergeProps } from 'solid-js';
import Button from '#components/Button';

import style from '#styles/ErrorFallback.module.scss';
import { RequiredDefaults } from '#shared/utils';


export type ErrorFallbackProps = {
  refresh: () => void;
  loading: boolean;
  horizontal?: boolean;
};

const defaultProps: RequiredDefaults<ErrorFallbackProps> = {
  horizontal: false,
};

const ErrorFallback: ParentComponent<ErrorFallbackProps & JSX.HTMLAttributes<HTMLDivElement>> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <div {...props} class={[style.error, props.class].join(' ')} classList={{
      [style.horizontal]: props.horizontal,
    }}>
      <span>{props.children}</span>
      <Button class={style.button} onClick={props.refresh} symbol='Refresh' loading={props.loading} color='primary'>Retry</Button>
    </div>
  );
};

export default ErrorFallback;
