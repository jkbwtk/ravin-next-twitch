import hljs from 'highlight.js/lib/core';

import style from '#styles/HighlightedCode.module.scss';

export type HighlightedCodeProps = {
  code: string;
  language: string;
  wrap?: string;
};

const removeWrap = (str: string, wrap: string) => {
  const split = str.replace(wrap, '').split('');
  split.splice(split.lastIndexOf(wrap), wrap.length);

  return split.join('');
};


const HighlightedCode: Component<HighlightedCodeProps> = (props) => {
  const code = props.wrap ? `${props.wrap}${props.code}${props.wrap}` : props.code;

  const highlighted = hljs.highlight(code, { language: props.language });
  const highlightedCode = props.wrap ? removeWrap(highlighted.value, props.wrap) : highlighted.value;

  return <pre class={style.container}>
    <code innerHTML={highlightedCode}>
    </code>
  </pre>;
};

export default HighlightedCode;
