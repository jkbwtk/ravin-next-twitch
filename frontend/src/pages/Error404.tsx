import Link from '#components/Link';

import style from '#styles/Error404.module.scss';


const Error404: Component = () => {
  return (
    <div class={style.container}>
      <span class={style.header}>404</span>
      <span class={style.message}>Page not found</span>

      <Link href='/' class={style.button} symbol='home' size='big' color='primary'>
        Go back to homepage
      </Link>
    </div>
  );
};

export default Error404;
