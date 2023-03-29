import { mergeProps } from 'solid-js';
import style from '#styles/MaterialSymbol.module.scss';


type SymbolColorTypes = 'gray' | 'primary';
type SymbolSizeTypes = 'small' | 'medium' | 'big';

interface MaterialSymbolProps {
  symbol: string;
  color?: SymbolColorTypes;
  size?: SymbolSizeTypes;
  interactive?: boolean;
  highlightColor?: SymbolColorTypes | 'none';
  filled?: boolean;
  customClass?: string;
}

const defaultProps: Required<MaterialSymbolProps> = {
  symbol: '',
  color: 'gray',
  size: 'medium',
  interactive: false,
  highlightColor: 'none',
  filled: false,
  customClass: '',
};

const MaterialSymbol: Component<MaterialSymbolProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  let colorClass;
  let highlightColorClass;
  let sizeClass;

  switch (props.color) {
    case 'gray':
      colorClass = style.gray;
      break;
    case 'primary':
      colorClass = style.primary;
      break;
  }

  switch (props.highlightColor) {
    case 'gray':
      highlightColorClass = style.grayHighlight;
      break;
    case 'primary':
      highlightColorClass = style.primaryHighlight;
      break;
    case 'none':
      highlightColorClass = '__ms_no_h__';
  }

  switch (props.size) {
    case 'small':
      sizeClass = style.small;
      break;
    case 'medium':
      sizeClass = style.medium;
      break;
    case 'big':
      sizeClass = style.big;
      break;
  }


  return (
    <span classList={{
      'material-symbols-rounded': true,
      [style.materialSymbol]: true,
      [colorClass]: true,
      [sizeClass]: true,
      [style.interactive]: props.interactive,
      [highlightColorClass]: props.interactive,
      [style.filled]: props.filled,
      [props.customClass]: true,
    }}>
      {props.symbol}
    </span>
  );
};


export default MaterialSymbol;
