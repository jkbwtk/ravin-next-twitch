import { useNotification } from '#providers/NotificationProvider';
import { batch, createContext, createSignal, onMount, ParentComponent, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { FrontendUser, GetFrontendUser } from '#types/api/auth';
import { GetSystemNotificationsResponse, SystemNotification } from '#shared/types/api/systemNotifications';
import DotSpinner from '#components/DotSpinner';

import style from '#styles/SessionProvider.module.scss';


export type SessionContextState = {
  loggedIn: boolean;
  user?: FrontendUser;
  notifications: SystemNotification[];
  unreadNotifications: SystemNotification[];
};

export type SessionContextValue = [
  state: SessionContextState,
  actions: {
    fetchUser: () => Promise<FrontendUser | null>
    invalidate: () => void;
    logout: () => void;

    fetchSystemNotifications: () => Promise<SystemNotification[] | null>
    markNotificationAsRead: (notification: SystemNotification) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    pushNotification: (notification: SystemNotification) => void;
    setNotificationsAsRead: (notificationIds: number[]) => void;
  }
];

const defaultState: SessionContextState = {
  loggedIn: false,
  notifications: [],
  unreadNotifications: [],
};

const SessionContext = createContext<SessionContextValue>([
  defaultState,
  {
    fetchUser: () => Promise.resolve(null),
    invalidate: () => null,
    logout: () => null,

    fetchSystemNotifications: () => Promise.resolve(null),
    markNotificationAsRead: () => Promise.resolve(),
    markAllNotificationsAsRead: () => Promise.resolve(),
    pushNotification: () => null,
    setNotificationsAsRead: () => null,
  },
]);

export const SessionProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);
  const [, { addNotification }] = useNotification();
  const [loaded, setLoaded] = createSignal(false);

  const fetchUser = async (): Promise<FrontendUser | null> => {
    const response = await fetch('/api/v1/auth/user', {
      cache: 'no-store',
    });

    if (response.ok) {
      const { data } = await response.json() as GetFrontendUser;

      batch(() => {
        setState('loggedIn', true);
        setState('user', data);
      });

      return data;
    }

    batch(() => {
      setState('loggedIn', false);
      setState('user', undefined);
    });
    return null;
  };

  const invalidate = () => {
    batch(() => {
      setState('loggedIn', false);
      setState('user', undefined);
    });

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
    const response = await fetch('/api/v1/notifications', {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.ok) {
      const { data } = await response.json() as GetSystemNotificationsResponse;
      const mapped = data.map((notification) => ({ ...notification, createdAt: new Date(notification.createdAt) }));
      const mappedUnread = mapped.filter((notification) => !notification.read);

      batch(() => {
        setState('notifications', mapped);
        setState('unreadNotifications', mappedUnread);
      });

      return mapped;
    } else {
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

    if (response.ok) {
      await fetchSystemNotifications();
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
    if (state.unreadNotifications.length === 0) return;
    const id = state.unreadNotifications.map((notification) => notification.id);

    const response = await fetch(`/api/v1/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await fetchSystemNotifications();
    } else {
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
    await fetchUser();

    if (state.loggedIn) {
      await fetchSystemNotifications();
    }

    setLoaded(true);
  });

  return (
    <SessionContext.Provider value={[state, {
      invalidate,
      fetchUser,
      logout,
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
