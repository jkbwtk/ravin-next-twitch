import { AnchorProps, Link } from '@solidjs/router';

import style from '#styles/AnchorText.module.scss';


const AnchorText: ParentComponent<AnchorProps> = (props) => {
  const customClass = [style.anchor, props.class].join(' ');

  return (
    <Link {...props} class={customClass} >
      {props.children ?? props.href}
    </Link>
  );
};

export default AnchorText;
