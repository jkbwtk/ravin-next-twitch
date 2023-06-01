import { JSX, mergeProps } from 'solid-js';

import inputStyle from '#styles/InputBase.module.scss';
import style from '#styles/TextArea.module.scss';


export type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

const defaultProps: TextAreaProps = {
  placeholder: '',
};

const TextArea: Component<TextAreaProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return <textarea {...props} class={[inputStyle.input, style.textarea, props.class].join(' ')} />;
};

export default TextArea;
