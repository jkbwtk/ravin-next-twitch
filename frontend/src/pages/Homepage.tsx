import type { Component } from 'solid-js';

import style from '#styles/Homepage.module.scss';
import ravinLogo from '#assets/ravinLogo.svg';

const Homepage: Component = () => {
  return (
    <div classList={{ [style.container]: true }}>
      <img class={style.logo} src={ravinLogo} alt='Ravin NeXT' draggable={false} />
    </div>
  );
};

export default Homepage;
