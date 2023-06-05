import { JSX, mergeProps } from 'solid-js';

import style from '#styles/Input.module.scss';


export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const defaultProps = {
  placeholder: ' ',
};

const Input: Component<InputProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <div class={style.container}>
      <input {...props} class={[style.input, props.class].join(' ')} />
      <label class={style.label} for={props.id}>{props.label ?? props.placeholder}</label>
    </div>
  );
};

export default Input;
