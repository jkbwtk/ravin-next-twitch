import { Component, createSignal, JSX, mergeProps } from 'solid-js';

import style from '#styles/AnimatedImage.module.scss';


const AnimatedImage: Component<{ src: string } & JSX.HTMLAttributes<HTMLImageElement>> = (props) => {
  const [loading, setLoading] = createSignal(true);

  const mergedClassList = () => mergeProps(props.classList, {
    // [style.animatedImage]: true,
    [style.loaded]: !loading(),
  });

  return (
    <img
      {...props}
      class={[style.animatedImage, props.class].join(' ')}
      classList={mergedClassList()}
      onLoad={() => setLoading(false)}
    />
  );
};

export default AnimatedImage;
