import { useNotification } from '#providers/NotificationProvider';
import { batch, createContext, createSignal, onMount, ParentComponent, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { FrontendUser, GetSession, Session } from '#types/api/auth';
import { GetSystemNotificationsResponse, SystemNotification } from '#shared/types/api/systemNotifications';
import DotSpinner from '#components/DotSpinner';
import { makeRequest } from '#lib/fetch';
import { isDev } from 'solid-js/web';
import { Config } from '#shared/types/api/auth';
import { defaultConfigValues } from '#shared/config';

import style from '#styles/SessionProvider.module.scss';


export type SessionContextState = {
  user: FrontendUser | null;
  config: Config;
  notifications: SystemNotification[];
  unreadNotifications: SystemNotification[];
};

export type SessionContextValue = [
  state: SessionContextState,
  actions: {
    fetchSession: () => Promise<Session>
    invalidate: () => void;
    logout: () => void;

    isAuthenticated: () => boolean;

    fetchSystemNotifications: () => Promise<SystemNotification[] | null>
    markNotificationAsRead: (notification: SystemNotification) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    pushNotification: (notification: SystemNotification) => void;
    setNotificationsAsRead: (notificationIds: number[]) => void;
  }
];

const defaultState: SessionContextState = {
  user: null,
  config: structuredClone(defaultConfigValues),
  notifications: [],
  unreadNotifications: [],
};

const SessionContext = createContext<SessionContextValue>([
  defaultState,
  {
    fetchSession: () => {
      throw Error('SessionContext: fetchSession() called before provider');
    },
    invalidate: () => {
      throw Error('SessionContext: invalidate() called before provider');
    },
    logout: () => {
      throw Error('SessionContext: logout() called before provider');
    },

    isAuthenticated: () => {
      throw Error('SessionContext: isLogged() called before provider');
    },

    fetchSystemNotifications: () => {
      throw Error('SessionContext: fetchSystemNotifications() called before provider');
    },
    markNotificationAsRead: () => {
      throw Error('SessionContext: markNotificationAsRead() called before provider');
    },
    markAllNotificationsAsRead: () => {
      throw Error('SessionContext: markAllNotificationsAsRead() called before provider');
    },
    pushNotification: () => {
      throw Error('SessionContext: pushNotification() called before provider');
    },
    setNotificationsAsRead: () => {
      throw Error('SessionContext: setNotificationsAsRead() called before provider');
    },
  },
]);

export const SessionProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const [loaded, setLoaded] = createSignal(false);

  const isAuthenticated = () => state.user !== null;

  const fetchSession = async (): Promise<Session> => {
    try {
      const { data } = await makeRequest('/api/v1/auth/session', { schema: GetSession, cache: 'no-store' });

      batch(() => {
        setState('user', data.user);
        setState('config', data.config);
      });

      return data;
    } catch (err) {
      if (isDev) console.error(err);

      batch(() => {
        setState('user', null);
        setState('config', structuredClone(defaultState.config));
      });

      addNotification({
        type: 'error',
        title: 'Session Error',
        message: 'Failed to fetch session data',
        duration: 5000,
      });

      return { user: null, config: structuredClone(defaultState.config) };
    }
  };

  const invalidate = () => {
    // batch(() => {
    //   setState('user', null);
    //   setState('config', structuredClone(defaultState.config));
    //   setState('notifications', []);
    //   setState('unreadNotifications', []);
    // });

    location.pathname = '/';
  };

  const logout = async () => {
    const response = await fetch('/api/v1/auth/logout', { method: 'POST' });

    if (response.ok) {
      invalidate();
    } else {
      addNotification({
        type: 'error',
        title: 'Logout failed',
        message: 'Something went wrong while trying to log you out. Please try again later.',
        duration: 10000,
      });
    }
  };

  const fetchSystemNotifications = async (): Promise<SystemNotification[]> => {
    try {
      const { data } = await makeRequest('/api/v1/notifications', { schema: GetSystemNotificationsResponse, cache: 'no-store' });
      const unread = data.filter((notification) => !notification.read);

      batch(() => {
        setState('notifications', data);
        setState('unreadNotifications', unread);
      });

      return data;
    } catch (err) {
      if (isDev) console.error(err);

      addNotification({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to fetch notifications',
        duration: 5000,
      });

      batch(() => {
        setState('notifications', []);
        setState('unreadNotifications', []);
      });

      return [];
    }
  };

  const markNotificationAsRead = async (notification: SystemNotification) => {
    const response = await fetch(`/api/v1/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: notification.id }),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to mark notification as read',
        duration: 5000,
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (state.unreadNotifications.length === 0) return;
    const id = state.unreadNotifications.map((notification) => notification.id);

    const response = await fetch(`/api/v1/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to mark all notifications as read',
        duration: 5000,
      });
    }
  };

  const pushNotification = (notification: SystemNotification) => {
    batch(() => {
      setState('notifications', (prev) => [...prev, notification]);

      if (!notification.read) {
        setState('unreadNotifications', (prev) => [...prev, notification]);
      }
    });
  };

  const setNotificationsAsRead = (notificationIds: number[]) => {
    batch(() => {
      setState('notifications', (prev) => prev.map((notification) => {
        if (notificationIds.includes(notification.id)) {
          return { ...notification, read: true };
        }

        return notification;
      }));

      setState('unreadNotifications', (prev) => prev.filter((notification) => !notificationIds.includes(notification.id)));
    });
  };

  onMount(async () => {
    await fetchSession();

    if (isAuthenticated()) {
      await fetchSystemNotifications();
    }

    setLoaded(true);
  });

  return (
    <SessionContext.Provider value={[state, {
      invalidate,
      fetchSession: fetchSession,
      logout,
      isAuthenticated: isAuthenticated,
      fetchSystemNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      pushNotification,
      setNotificationsAsRead,
    }]}>
      <Show
        when={loaded()}
        fallback={
          <div class={style.container}>
            <DotSpinner />
            <span class={style.description}>
              Getting things ready
            </span>
          </div>
        }
      >
        {props.children}
      </Show>
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => useContext(SessionContext);
