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
  customClass?: string;
  draggable?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const defaultProps: Required<ButtonProps> = {
  ...defaultBaseProps,
  color: 'gray',
  size: 'medium',
  customClass: '',
  draggable: false,
  disabled: false,
  loading: false,
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
        [style.disabled]: props.disabled,
        [style.loading]: props.loading,
        [props.customClass]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </button>
  );
};

export default Button;
