import { mergeProps } from 'solid-js';
import { quickSwitch } from '#shared/utils';

import style from '#styles/MaterialSymbol.module.scss';


export type SymbolColorType = 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'primary';
export type SymbolHighlightColorType = SymbolColorType | 'none';
export type SymbolSizeType = 'small' | 'medium' | 'big';

interface MaterialSymbolProps {
  symbol: string;
  color?: SymbolColorType;
  size?: SymbolSizeType;
  interactive?: boolean;
  highlightColor?: SymbolHighlightColorType;
  filled?: boolean;
  class?: string;
}

const defaultProps: Required<MaterialSymbolProps> = {
  symbol: '',
  color: 'gray',
  size: 'medium',
  interactive: false,
  highlightColor: 'none',
  filled: false,
  class: '',
};

const MaterialSymbol: Component<MaterialSymbolProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  const colorClass = quickSwitch<string, SymbolColorType>(props.color, {
    gray: style.gray,
    red: style.red,
    green: style.green,
    blue: style.blue,
    yellow: style.yellow,
    primary: style.primary,
    default: style.gray,
  });

  const highlightColorClass = quickSwitch<string, SymbolHighlightColorType>(props.highlightColor, {
    gray: style.grayHighlight,
    red: style.redHighlight,
    green: style.greenHighlight,
    blue: style.blueHighlight,
    yellow: style.yellowHighlight,
    primary: style.primaryHighlight,

    none: '__ms_no_h__',
    default: '__ms_no_h__',
  });

  const sizeClass = quickSwitch<string, SymbolSizeType>(props.size, {
    small: style.small,
    medium: style.medium,
    big: style.big,
    default: style.medium,
  });

  return (
    <span classList={{
      'material-symbols-rounded': true,
      [style.materialSymbol]: true,
      [colorClass]: true,
      [sizeClass]: true,
      [style.interactive]: props.interactive,
      [highlightColorClass]: props.interactive,
      [style.filled]: props.filled,
      [props.class]: true,
    }}>
      {props.symbol}
    </span>
  );
};


export default MaterialSymbol;
