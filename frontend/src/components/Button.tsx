import { JSX, mergeProps } from 'solid-js';
import ButtonBase, {
  ButtonBaseColorTypes,
  ButtonBaseExcludedProps,
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
}

export const defaultProps: Omit<Required<ButtonProps>, 'children'> = {
  ...defaultBaseProps,
  color: 'gray',
  size: 'medium',
  customClass: '',
  draggable: false,
};

const Button: Component<ButtonProps & Omit<JSX.HTMLAttributes<HTMLButtonElement>, ButtonBaseExcludedProps>> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  const colorClass = getColorClass(props.color);
  const sizeClass = getSizeClass(props.size);

  return (
    <button
      classList={{
        [style.button]: true,
        [colorClass]: true,
        [sizeClass]: true,
        [props.customClass]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </button>
  );
};

export default Button;
