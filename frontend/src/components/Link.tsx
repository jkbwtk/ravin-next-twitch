import { mergeProps } from 'solid-js';
import { Link as RouterLink, LinkProps as RouterLinkProps } from '@solidjs/router';
import { ButtonProps, defaultProps } from '#components/Button';
import ButtonBase, { ButtonBaseExcludedProps, getColorClass, getSizeClass } from '#components/ButtonBase';

import style from '#styles/ButtonBase.module.scss';


interface LinkProps extends ButtonProps{
  end?: boolean;
}

const defaultLinkProps: Omit<Required<LinkProps>, 'children'> = {
  ...defaultProps,
  end: true,
};

const Link: Component<LinkProps & Omit<RouterLinkProps, ButtonBaseExcludedProps>> = (userProps) => {
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
