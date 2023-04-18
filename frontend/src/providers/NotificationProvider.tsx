import { createContext, createEffect, createMemo, createSignal, For, JSX, onCleanup, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import MaterialSymbol, { SymbolColorType } from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { quickSwitch } from '#shared/utils';

import style from '#styles/NotificationProvider.module.scss';


export type NotificationType = 'success' | 'info' | 'error';

export type Notification = {
  id: number;
  title: string;
  message: string | JSX.Element;
  type: NotificationType;
  duration?: number;
};

export type NotificationContextState = {
  notificationIdSequence: number;
  maxNotifications: number;
  notifications: Notification[];
};

export type NotificationContextValue = [
  state: NotificationContextState,
  actions: {
    /**
     * Adds a notification to the notification queue.
     * @param notification The notification to add.
     * @returns The id of the notification.
     */
    addNotification: (notification: Omit<Notification, 'id'>) => number;

    /**
     * Removes a notification from the notification queue.
     * @param id The id of the notification to remove.
     */
    removeNotification: (id: number) => void;

    /**
     * Skips to the next notification in the queue.
     * @returns The id of the skipped notification.
     */
    nextNotification: () => number;

    /**
     * Clears all notifications from the queue.
     * @returns The number of notifications cleared.
     */
    clearNotifications: () => number;

    /**
     * Sets the maximum number of notifications that can be displayed at once.
     * @param value The new maximum number of notifications.
     */
    setMaxNotifications: (value: number) => void;
  }
];

export const defaultState: NotificationContextState = {
  notificationIdSequence: 0,
  maxNotifications: 3,
  notifications: [],
};

const NotificationContext = createContext<NotificationContextValue>([
  defaultState,
  {
    addNotification: () => 0,
    removeNotification: () => null,
    nextNotification: () => 0,
    clearNotifications: () => 0,
    setMaxNotifications: () => null,
  },
]);


export const NotificationProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = state.notificationIdSequence;
    const fullNotification = { ...notification, id };

    setState('notificationIdSequence', id + 1);
    setState('notifications', [...state.notifications, fullNotification]);

    return id;
  };

  const removeNotification = (id: number) => {
    setState('notifications', state.notifications.filter((notification) => notification.id !== id));
  };

  const nextNotification = () => {
    const targetId = state.notifications[0].id;

    removeNotification(state.notifications[0].id);
    return targetId;
  };

  const clearNotifications = () => {
    const length = state.notifications.length;

    setState('notifications', []);
    return length;
  };

  const setMaxNotifications = (value: number) => setState('maxNotifications', value);

  const notificationOverflowLength = createMemo(() => Math.max(0, state.notifications.length - state.maxNotifications));

  return (
    <NotificationContext.Provider
      value={[
        state,
        {
          addNotification,
          removeNotification,
          nextNotification,
          clearNotifications,
          setMaxNotifications,
        },
      ]}
    >
      {props.children}

      <ul class={style.container}>
        <For each={state.notifications.slice(0, state.maxNotifications)}>
          {(notification, index) => {
            const [shown, setShown] = createSignal(true);
            let timeout = -1;

            const removeElement = () => {
              setShown(false);

              setTimeout(() => {
                removeNotification(notification.id);
              }, 200);
            };

            const createTimeout = () => {
              if (index() === 0 && notification.duration !== undefined) {
                timeout = setTimeout(() => {
                  timeout = -1;
                  removeElement();
                }, notification.duration) as unknown as number;
              }
            };

            const removeTimeout = () => {
              if (timeout !== -1) {
                clearTimeout(timeout);
              }
            };

            createEffect(() => {
              createTimeout();
            });

            onCleanup(() => {
              removeTimeout();
            });

            const color = quickSwitch<SymbolColorType, NotificationType>(notification.type, {
              success: 'green',
              info: 'blue',
              error: 'red',
              default: 'gray',
            });

            const symbol = quickSwitch<string, NotificationType>(notification.type, {
              success: 'check_circle',
              info: 'info',
              error: 'warning',
              default: 'help',
            });

            return (
              <li
                classList={{
                  [style.notification]: true,
                  [style.hideNotification]: !shown(),
                }}
                onMouseEnter={removeTimeout}
                onMouseLeave={createTimeout}
                style={{
                  '--notification-duration': notification.duration ? `${notification.duration}ms` : 'unset',
                }}
              >

                <MaterialSymbol symbol={symbol} color={color} />
                <div class={style.content}>
                  <span class={style.title}>{notification.title}</span>
                  <Show
                    when={typeof notification.message !== 'string'}
                    fallback={<p>{notification.message}</p>}
                  >
                    {notification.message}
                  </Show>
                </div>
                <TemplateButton
                  class={style.closeButton}
                  onClick={removeElement}
                >
                  <MaterialSymbol
                    symbol='close'
                    color='gray'
                    interactive
                  />
                </TemplateButton>
              </li>
            );
          }}
        </For>

        <Show when={notificationOverflowLength() > 0}>
          <div class={style.overflowCounter} >
              and {notificationOverflowLength()} more...
          </div>
        </Show>
      </ul>
    </NotificationContext.Provider>);
};

export const useNotification = (): NotificationContextValue => useContext(NotificationContext);
