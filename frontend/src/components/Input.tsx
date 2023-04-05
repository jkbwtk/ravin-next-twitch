import { JSX, mergeProps } from 'solid-js';

import style from '#styles/Input.module.scss';


export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const defaultProps = {
  placeholder: ' ',
};

const Input: Component<InputProps> = (props) => {
  const mergedProps = mergeProps(defaultProps, props);

  return (
    <div class={style.container}>
      <input {...mergedProps} class={[style.input, mergedProps.class].join(' ')} />
      <label class={style.label} for={props.id}>{props.label ?? props.placeholder}</label>
    </div>
  );
};

export default Input;
