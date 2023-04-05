import { JSX, mergeProps } from 'solid-js';
import ButtonBase, {
  getColorClass,
  getSizeClass,
} from '#components/ButtonBase';
import { ButtonProps, defaultProps } from '#components/Button';

import style from '#styles/ButtonBase.module.scss';


const Anchor: Component<ButtonProps & JSX.AnchorHTMLAttributes<HTMLAnchorElement>> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);

  const colorClass = getColorClass(props.color);
  const sizeClass = getSizeClass(props.size);

  return (
    <a
      classList={{
        [style.button]: true,
        [colorClass]: true,
        [sizeClass]: true,
        [props.class]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </a>
  );
};

export default Anchor;
