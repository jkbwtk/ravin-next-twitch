import { createSignal, JSX, mergeProps } from 'solid-js';

import style from '#styles/InputBase.module.scss';


export type InputBaseProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'classList'>;

const defaultProps: InputBaseProps = {
  placeholder: '',
};

const InputBase: Component<InputBaseProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);
  const [typing, setTyping] = createSignal(false);

  let typingTimeoutHandle: number | undefined = undefined;

  const handleTyping = () => {
    setTyping(true);

    if (typingTimeoutHandle) clearTimeout(typingTimeoutHandle);
    typingTimeoutHandle = undefined;

    typingTimeoutHandle = setTimeout(() => {
      setTyping(false);
    }, 1000) as unknown as number;
  };

  const handleInput = (ev: InputEvent) => {
    if (!(ev.target instanceof HTMLInputElement)) return;
    if (!(ev.currentTarget instanceof HTMLInputElement)) return;

    handleTyping();

    if (typeof props.onInput === 'function') props.onInput(ev as never); // TODO: Fix this
  };

  return (
    <input {...props} class='' onInput={handleInput} classList={{
      [style.typing]: typing(),
      [style.input]: true,
      [props.class ?? '']: true,
    }} />
  );
};

export default InputBase;
