import { mergeProps } from 'solid-js';
import { Link as RouterLink, LinkProps as RouterLinkProps } from '@solidjs/router';
import { ButtonProps, defaultProps } from '#components/Button';
import ButtonBase, { getColorClass, getSizeClass } from '#components/ButtonBase';

import style from '#styles/ButtonBase.module.scss';


interface LinkProps extends ButtonProps{
  end?: boolean;
}

const defaultLinkProps: Required<LinkProps> = {
  ...defaultProps,
  end: true,
};

const Link: Component<LinkProps & RouterLinkProps> = (userProps) => {
  const props = mergeProps(defaultLinkProps, userProps);

  const colorClass = getColorClass(props.color);
  const sizeClass = getSizeClass(props.size);

  return (
    <RouterLink
      classList={{
        [style.button]: true,
        [colorClass]: true,
        [sizeClass]: true,
        [props.customClass]: true,
      }}
      {...props}
    >
      <ButtonBase {...props} />
    </RouterLink>
  );
};

export default Link;
