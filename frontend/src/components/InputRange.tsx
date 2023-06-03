import { createMemo, createSignal, JSX, mergeProps, Show } from 'solid-js';

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


  const handleInput: InputRangeProps['onInput'] = (ev) => {
    setValue(ev.target.valueAsNumber);

    if (typeof props.onInput === 'function') props.onInput(ev);
  };

  const handleChange: InputRangeProps['onChange'] = (change) => {
    setValue(change.target.valueAsNumber);

    if (typeof props.onChange === 'function') props.onChange(change);
  };

  const valueReadout = createMemo(() => {
    return `${props.label ?? ''} ${value()} ${props.unit ?? ''}`.trim();
  });

  return (
    <div class={inputStyle.container}>
      <input
        {...props}
        type='range'
        onInput={handleInput}
        onChange={handleChange}
        class={[style.range, props.class].join(' ')}
      />
      <Show when={props.label}>
        <label class={[inputStyle.label, style.label].join(' ')} for={props.id}>{valueReadout()}</label>
      </Show>
    </div>
  );
};

export default InputRange;
