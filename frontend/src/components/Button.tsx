import { JSX, mergeProps } from 'solid-js';
import ButtonBase, {
  ButtonBaseColorTypes,
  ButtonBaseProps,
  ButtonBaseSizeTypes,
  defaultProps as defaultBaseProps,
  getColorClass,
  getSizeClass,
} from '#components/ButtonBase';

import style from '#styles/ButtonBase.module.scss';


export interface ButtonProps extends ButtonBaseProps {
  color?: ButtonBaseColorTypes;
  size?: ButtonBaseSizeTypes;
  class?: string;
  draggable?: boolean;
}

export const defaultProps: Required<ButtonProps> = {
  ...defaultBaseProps,
  color: 'gray',
  size: 'medium',
  class: '',
  draggable: false,
};

const Button: Component<ButtonProps & JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  const colorClass = getColorClass(props.color);
  const sizeClass = getSizeClass(props.size);

  return (
    <button
      classList={{
        [style.button]: true,
        [colorClass]: true,
        [sizeClass]: true,
        [props.class]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </button>
  );
};

export default Button;


(
  <Button>
    <span>Button</span>
  </Button>
);
