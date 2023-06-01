import { JSX, mergeProps } from 'solid-js';

import inputStyle from '#styles/InputBase.module.scss';
import style from '#styles/Select.module.scss';


export type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement>;

const defaultProps: SelectProps = {};

const Select: Component<SelectProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <select {...props} class={[inputStyle.input, style.select, props.class].join(' ')} />
  );
};

export default Select;
