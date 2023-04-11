import { JSX } from 'solid-js';

import style from '#styles/AnchorText.module.scss';


const AnchorText: ParentComponent<JSX.AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => {
  const customClass = [style.anchor, props.class].join(' ');

  return (
    <a {...props} class={customClass} >
      {props.children ?? props.href}
    </a>
  );
};

export default AnchorText;
