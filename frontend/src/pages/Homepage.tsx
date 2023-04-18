import AnchorButton from '#components/AnchorButton';
import { useSession } from '#providers/SessionProvider';
import AnimatedImage from '#components/AnimatedImage';
import AnchorText from '#components/AnchorText';
import { Show } from 'solid-js';
import Link from '#components/Link';

import style from '#styles/Homepage.module.scss';
import ravinLogo from '#assets/ravinLogoCompact.svg';


const Homepage: Component = () => {
  const [session] = useSession();

  return (
    <div class={style.container}>
      <Show
        when={session.loggedIn}
        fallback={
          <>
            <img class={style.logo} src={ravinLogo} alt='Ravin NeXT' draggable={false} />
            <AnchorButton href='/api/v1/auth/twitch'>Login with twitch</AnchorButton>
          </>
        }
      >
        <AnimatedImage class={style.avatar} src={session.user?.profileImageUrl} />
        <span>
        Welcome back
          <AnchorText
            href={`https://twitch.tv/${session.user?.login}`}
          >
            {session.user?.displayName}
          </AnchorText>
        </span>
        <Link href='/dashboard' symbol='dashboard'>Dashboard</Link>

        <AnchorButton href='/api/v1/auth/logout'>Logout</AnchorButton>

        <AnchorButton href='/api/v1/auth/user'>Fetch current user</AnchorButton>
      </Show>
    </div>
  );
};

export default Homepage;
