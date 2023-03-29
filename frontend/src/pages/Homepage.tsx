import style from '#styles/Homepage.module.scss';
import ravinLogo from '#assets/ravinLogoCompact.svg';


const Homepage: Component = () => {
  return (
    <div classList={{ [style.container]: true }}>
      <img class={style.logo} src={ravinLogo} alt='Ravin NeXT' draggable={false} />
    </div>
  );
};

export default Homepage;
