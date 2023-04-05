import { createSignal, JSX, mergeProps } from 'solid-js';

import style from '#styles/AnimatedImage.module.scss';


const AnimatedImage: Component<JSX.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [loading, setLoading] = createSignal(true);

  const mergedClassList = () => mergeProps(props.classList, {
    // [style.animatedImage]: true,
    [style.loaded]: !loading(),
  });

  return (
    <img
      class={[style.animatedImage, props.class].join(' ')}
      classList={mergedClassList()}
      onLoad={() => setLoading(false)}
      {...props}
    />
  );
};

export default AnimatedImage;
