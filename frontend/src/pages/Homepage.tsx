import AnchorButton from '#components/AnchorButton';
import { useSession } from '#providers/SessionProvider';
import AnimatedImage from '#components/AnimatedImage';
import AnchorText from '#components/AnchorText';
import { createSignal, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import Link from '#components/Link';

import style from '#styles/Homepage.module.scss';
import ravinLogo from '#assets/ravinLogo.svg';
import SystemNotificationsIcon from '#components/SystemNotificationsIcon';
import Button from '#components/Button';

import dashboard from '#assets/dashboard.png';
import commandsDashboard from '#assets/commandsDashboard.png';
import customCommands from '#assets/customCommands.png';
import settings from '#assets/settings.png';
import { Transition } from 'solid-transition-group';
import MaterialSymbol from '#components/MaterialSymbol';


const Homepage: Component = () => {
  const [session, { logout }] = useSession();
  const [counter, setCounter] = createSignal(0);

  let intervalHandle: undefined | number = undefined;

  const incrementCounter = () => {
    setCounter((prev) => (prev + 1) % 4);
  };

  onMount(() => {
    intervalHandle = setInterval(incrementCounter, 5000) as unknown as number;
  });

  onCleanup(() => {
    if (intervalHandle) {
      clearInterval(intervalHandle);
    }
  });

  return (
    <div class={style.container}>
      <div class={style.topBar}>
        <img class={style.logo} src={ravinLogo} alt='Ravin NeXT' draggable={false} />

        <Switch>
          <Match when={session.loggedIn}>
            <SystemNotificationsIcon />
            <AnimatedImage class={style.avatar} src={session.user?.profileImageUrl} />
          </Match>
          <Match when={!session.loggedIn}>
            <AnchorButton class={style.button} color='gray' size='medium' href='/api/v1/auth/twitch'>Login with twitch</AnchorButton>
          </Match>
        </Switch>
      </div>

      <div class={style.content}>
        <div>
          <h1 class={style.title}>Your Instance, Your Rules</h1>
          <p class={style.description}>
          Ravin NeXT is a self hosted Twitch moderation tool that allows you to manage your channel's chat,
            generate statistics and much more. You probably know all of this since you're here, but if you don't,
            you can read more about it in the dashboard.
          </p>
        </div>

        <div class={style.interactive}>
          <Switch>
            <Match when={session.loggedIn}>
              <span class={style.message}>
              Welcome back
                <AnchorText
                  href={`https://twitch.tv/${session.user?.login}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {session.user?.displayName}
                </AnchorText>
              </span>
              <span class={style.info}>Click on the button below to access your dashboard or logout</span>

              <div class={style.buttons}>
                <Button customClass={style.button} color='primary' size='big' onClick={logout}>Logout</Button>
                <Link customClass={style.button} href='/dashboard' size='big' symbol='dashboard'>Dashboard</Link>
              </div>
            </Match>
            <Match when={!session.loggedIn}>
              <span class={style.info}>Click on the button below to login with twitch</span>
              <AnchorButton customClass={style.button} color='primary' size='big' href='/api/v1/auth/twitch'>Login with twitch</AnchorButton>
            </Match>
          </Switch>
        </div>
      </div>

      <div class={style.preview}>
        <div class={style.imageContainer}>
          <Transition
            enterActiveClass={style.previewImageEnter}
            exitActiveClass={style.previewImageExit}
          >
            <Show when={counter() === 0}>
              <img class={style.previewImage} src={dashboard} draggable={false} />
            </Show>
          </Transition>

          <Transition
            enterActiveClass={style.previewImageEnter}
            exitActiveClass={style.previewImageExit}
          >
            <Show when={counter() === 1}>
              <img class={style.previewImage} src={commandsDashboard} draggable={false} />
            </Show>
          </Transition>

          <Transition
            enterActiveClass={style.previewImageEnter}
            exitActiveClass={style.previewImageExit}
          >
            <Show when={counter() === 2}>
              <img class={style.previewImage} src={customCommands} draggable={false} />
            </Show>
          </Transition>
          <Transition
            enterActiveClass={style.previewImageEnter}
            exitActiveClass={style.previewImageExit}
          >
            <Show when={counter() === 3}>
              <img class={style.previewImage} src={settings} draggable={false} />
            </Show>
          </Transition>
        </div>
      </div>

      <div class={style.footer}>
        <AnchorText
          class={style.element}
          href='https://github.com/jkbwtk/ravin-next-twitch'
          target='_blank'
          rel='noopener noreferrer'
        >
          <MaterialSymbol symbol='code' size='small' color='gray' />
          <span class={style.text}>github</span>
        </AnchorText>

        <AnchorText
          class={style.element}
          href='https://github.com/jkbwtk/ravin-next-twitch/issues'
          target='_blank'
          rel='noopener noreferrer'
        >
          <MaterialSymbol symbol='bug_report' size='small' color='gray' />
          <span class={style.text}>report a bug</span>
        </AnchorText>

        <AnchorText
          class={style.element}
          href='https://github.com/jkbwtk/ravin-next-twitch/blob/goldsrc/README.md'
          target='_blank'
          rel='noopener noreferrer'
        >
          <MaterialSymbol symbol='help' size='small' color='gray' />
          <span class={style.text}>help</span>
        </AnchorText>
      </div>
    </div>
  );
};

export default Homepage;
