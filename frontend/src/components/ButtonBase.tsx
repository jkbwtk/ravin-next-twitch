import MaterialSymbol from '#components/MaterialSymbol';
import { mergeProps, Show } from 'solid-js';

import style from '#styles/ButtonBase.module.scss';


export type ButtonBaseColorTypes = 'gray' | 'primary';
export type ButtonBaseSizeTypes = 'medium' | 'big';

export interface ButtonBaseProps {
  symbol?: string;
}

export const defaultProps: Required<ButtonBaseProps> = {
  symbol: '',
};

export const getColorClass = (color: ButtonBaseColorTypes): string => {
  switch (color) {
    case 'gray':
      return style.gray;
    case 'primary':
      return style.primary;
  }
};

export const getSizeClass = (size: ButtonBaseSizeTypes): string => {
  switch (size) {
    case 'medium':
      return style.medium;
    case 'big':
      return style.big;
  }
};


const ButtonBase: ParentComponent<ButtonBaseProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  return (
    <>
      <Show when={props.children}>
        <span class={style.text}>{props.children}</span>
      </Show>
      <Show when={props.symbol.length !== 0}>
        <MaterialSymbol symbol={props.symbol} />
      </Show>
    </>
  );
};

export default ButtonBase;
