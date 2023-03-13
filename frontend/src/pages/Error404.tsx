import type { Component } from 'solid-js';

import style from '#styles/Error404.module.scss';
import Link from '#components/Link';


const Error404: Component = () => {
  return (
    <div class={style.container}>
      <span class={style.code}>404</span>
      <span class={style.message}>Page not found</span>

      <Link href='/' customClass={style.button} symbol='home' size='big' color='primary'>
        Go back to homepage
      </Link>
    </div>
  );
};

export default Error404;
