import { createMemo, createResource, createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import MaterialSymbol from '#components/MaterialSymbol';
import { GetSystemNotificationsResponse, SystemNotification } from '#types/api/systemNotifications';
import { Transition } from 'solid-transition-group';
import { timeFromNow } from '#shared/timeUtils';
import { useNotification } from '#providers/NotificationProvider';

import style from '#styles/SystemNotificationsIcon.module.scss';


const fetchSystemNotifications = async (): Promise<SystemNotification[]> => {
  const response = await fetch('/api/v1/notifications', {
    method: 'GET',
    cache: 'no-store',
  });
  const { data } = await response.json() as GetSystemNotificationsResponse;

  return data.map((notification) => ({ ...notification, createdAt: new Date(notification.createdAt) }));
};

const SystemNotificationsIcon: Component = () => {
  const [, { addNotification }] = useNotification();

  const [notificationOpen, setNotificationOpen] = createSignal(false);
  const [notifications, { refetch: refetchNotifications }] = createResource(
    fetchSystemNotifications,
    {
      initialValue: [],
    },
  );

  const unreadNotifications = createMemo(() => notifications().filter((notification) => !notification.read));

  const markNotificationAsRead = async (notification: SystemNotification) => {
    const response = await fetch(`/api/v1/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: notification.id }),
    });

    if (response.ok) {
      refetchNotifications();
    } else {
      addNotification({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to mark notification as read',
        duration: 5000,
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    const id = unreadNotifications().map((notification) => notification.id);

    if (unreadNotifications().length === 0) return;

    const response = await fetch(`/api/v1/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      refetchNotifications();
    } else {
      addNotification({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to mark all notifications as read',
        duration: 5000,
      });
    }
  };

  let containerRef = document.createElement('div');
  let intervalTimer: number | undefined;

  const hideNotificationOnOutsideClick = (ev: MouseEvent) => {
    if (!containerRef.contains(ev.target as Node)) {
      setNotificationOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('click', hideNotificationOnOutsideClick);

    if (intervalTimer !== undefined) clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
      refetchNotifications();
    }, 60000) as unknown as number;
  });

  onCleanup(() => {
    document.removeEventListener('click', hideNotificationOnOutsideClick);

    clearInterval(intervalTimer);
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
          symbol={unreadNotifications().length > 0 ? 'notifications_active' : 'notifications'}
          size='big'
          color='gray'
          filled={unreadNotifications().length > 0}
          interactive={true}
          highlightColor={'gray'}
        />

        <Show when={unreadNotifications().length > 0}>
          <span class={style.counter}>{unreadNotifications().length > 9 ? '9+' : unreadNotifications().length}</span>
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
              <For each={notifications().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}>
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
