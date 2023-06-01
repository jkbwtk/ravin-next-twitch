import { createMemo, createSignal, JSX, mergeProps } from 'solid-js';

import inputStyle from '#styles/InputBase.module.scss';
import style from '#styles/InputRange.module.scss';


export type InputRangeProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  unit?: string;
};

const defaultProps: InputRangeProps = {
};

const InputRange: Component<InputRangeProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);
  const [value, setValue] = createSignal(props.value ?? props.placeholder ?? 0);

  const handleInput = (ev: InputEvent) => {
    if (!(ev.target instanceof HTMLInputElement)) return;
    if (!(ev.currentTarget instanceof HTMLInputElement)) return;

    setValue(ev.target.valueAsNumber);

    if (typeof props.onInput === 'function') props.onInput(ev as never); // TODO: Fix this
  };

  const valueReadout = createMemo(() => {
    return `${props.label} ${value()} ${props.unit}`.trim();
  });

  return (
    <div class={inputStyle.container}>
      <input {...props} onInput={handleInput} class={[style.range, props.class].join(' ')} />
      <label class={[inputStyle.label, style.label].join(' ')} for={props.id}>{valueReadout()}</label>
    </div>
  );
};

export default InputRange;
