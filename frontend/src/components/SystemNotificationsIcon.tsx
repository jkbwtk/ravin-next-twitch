import { createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { Transition } from 'solid-transition-group';
import { timeFromNow } from '#shared/timeUtils';

import style from '#styles/SystemNotificationsIcon.module.scss';
import { useSession } from '#providers/SessionProvider';


const SystemNotificationsIcon: Component = () => {
  const [notificationOpen, setNotificationOpen] = createSignal(false);
  const [session, { markNotificationAsRead, markAllNotificationsAsRead }] = useSession();

  let containerRef = document.createElement('div');

  const hideNotificationOnOutsideClick = (ev: MouseEvent) => {
    if (!containerRef.contains(ev.target as Node)) {
      setNotificationOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', hideNotificationOnOutsideClick);
  });

  onCleanup(() => {
    document.removeEventListener('click', hideNotificationOnOutsideClick);
  });


  return (
    <div ref={containerRef} class={style.container}>
      <div
        class={style.icon}
        onClick={(ev) => {
          ev.preventDefault();

          const box = containerRef.getBoundingClientRect();
          const horizontalOffset = (window.innerWidth ?? 0) - box.right;
          const verticalOffset = box.bottom;

          containerRef.style.setProperty('--notification-icon-horizontal-offset', `${horizontalOffset}px`);
          containerRef.style.setProperty('--notification-icon-vertical-offset', `${verticalOffset}px`);

          setNotificationOpen(!notificationOpen());
        }}
      >
        <MaterialSymbol
          symbol={session.unreadNotifications.length > 0 ? 'notifications_active' : 'notifications'}
          size='big'
          color='gray'
          filled={session.unreadNotifications.length > 0}
          interactive={true}
          highlightColor='gray'
          active={notificationOpen()}
        />

        <Show when={session.unreadNotifications.length > 0}>
          <span class={style.counter}>{session.unreadNotifications.length > 9 ? '9+' : session.unreadNotifications.length}</span>
        </Show>
      </div>

      <Transition
        enterActiveClass={style.menuOpen}
        exitActiveClass={style.menuClose}
      >
        <Show when={notificationOpen()}>
          <div class={style.menu}>
            <div class={style.header}>
              <span>Notifications</span>

              <button
                class={style.clearAll}
                onClick={() => markAllNotificationsAsRead()}
              >Clear All</button>

              <button onClick={() => setNotificationOpen(false)}>
                <MaterialSymbol
                  symbol='close'
                  size='medium'
                  color='gray'
                  highlightColor='gray'
                  interactive={true}
                />
              </button>
            </div>

            <div class={style.notifications}>
              <For each={session.notifications.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}>
                {(notification) => (
                  <div class={style.notification}>
                    <Switch>
                      <Match when={notification.read}>
                        <span class={style.emptyIndicator} />
                      </Match>
                      <Match when={!notification.read}>
                        <button
                          class={style.unreadIndicator}
                          onClick={() => markNotificationAsRead(notification)}
                        />
                      </Match>
                    </Switch>

                    <div class={style.title}>
                      {notification.title}
                      <span class={style.time}>{timeFromNow(notification.createdAt)}</span>
                    </div>
                    <div class={style.content}>{notification.content}</div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Transition>
    </div>
  );
};

export default SystemNotificationsIcon;
