import { JSX, mergeProps } from 'solid-js';

import style from '#styles/InputCheckbox.module.scss';


export type InputCheckboxProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};


const InputCheckbox: Component<InputCheckboxProps> = (userProps) => {
  const defaultProps: Partial<InputCheckboxProps> = {
    id: Math.random().toString().slice(2),
    label: 'Checkbox',
  };

  const props = mergeProps(defaultProps, userProps);

  return (
    <div class={style.container}>
      <label for={props.id}>{props.label}:</label>
      <div class={style.checkbox}>
        <input {...props} type='checkbox' />
        <label for={props.id}></label>
      </div>
    </div>
  );
};

export default InputCheckbox;
