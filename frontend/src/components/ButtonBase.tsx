import MaterialSymbol from '#components/MaterialSymbol';
import { Component, JSX, mergeProps, Show } from 'solid-js';


import style from '#styles/ButtonBase.module.scss';

export type ButtonBaseColorTypes = 'gray' | 'primary';
export type ButtonBaseSizeTypes = 'medium' | 'big';
export type ButtonBaseExcludedProps = 'class';


export interface ButtonBaseProps {
  symbol?: string;
  children?: JSX.HTMLAttributes<HTMLButtonElement>['children'];
}

export const defaultProps: Omit<Required<ButtonBaseProps>, 'children'> = {
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


const ButtonBase: Component<ButtonBaseProps> = (userProps) => {
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
