import { JSX } from 'solid-js';

import style from '#styles/TemplateButton.module.scss';

const TemplateButton: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const customClass = [style.button, props.class].join(' ');

  return (
    <button {...props} class={customClass} >
      {props.children}
    </button>
  );
};

export default TemplateButton;
