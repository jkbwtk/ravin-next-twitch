import { JSX, mergeProps } from 'solid-js';
import ButtonBase, {
  ButtonBaseExcludedProps,
  getColorClass,
  getSizeClass,
} from '#components/ButtonBase';
import { ButtonProps, defaultProps } from '#components/Button';

import style from '#styles/ButtonBase.module.scss';


const Anchor: Component<ButtonProps & Omit<JSX.HTMLAttributes<HTMLAnchorElement>, ButtonBaseExcludedProps>> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  const colorClass = getColorClass(props.color);
  const sizeClass = getSizeClass(props.size);

  return (
    <a
      classList={{
        [style.button]: true,
        [colorClass]: true,
        [sizeClass]: true,
        [props.customClass]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </a>
  );
};

export default Anchor;
