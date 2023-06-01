import { mergeProps } from 'solid-js';

import style from '#styles/InputBase.module.scss';


export type InputLabeledProps = {
  label: string;
  for: string;
};

const defaultProps: Partial<InputLabeledProps> = {
  label: '[props]',
  for: '[props]',
};

const InputLabeled: ParentComponent<InputLabeledProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <div class={style.container}>
      <label class={style.label} for={props.for}>{props.label}</label>
      {props.children}
    </div>
  );
};

export default InputLabeled;
