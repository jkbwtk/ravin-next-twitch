import { A, AnchorProps } from '@solidjs/router';

import style from '#styles/AnchorText.module.scss';


const AnchorText: ParentComponent<AnchorProps> = (props) => {
  const customClass = [style.anchor, props.class].join(' ');

  return (
    <A {...props} class={customClass} >
      {props.children ?? props.href}
    </A>
  );
};

export default AnchorText;
