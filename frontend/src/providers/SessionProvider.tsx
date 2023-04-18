import { useNotification } from '#providers/NotificationProvider';
import { batch, createContext, createSignal, onMount, ParentComponent, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { FrontendUser, GetFrontendUser } from '#types/api/auth';
import DotSpinner from '#components/DotSpinner';

import style from '#styles/SessionProvider.module.scss';


export type SessionContextState = {
  loggedIn: boolean;
  user?: FrontendUser;
};

export type SessionContextValue = [
  state: SessionContextState,
  actions: {
    fetchUser: () => Promise<FrontendUser | null>
    invalidate: () => void;
    logout: () => void;
  }
];

const defaultState: SessionContextState = {
  loggedIn: false,
};

const SessionContext = createContext<SessionContextValue>([
  defaultState,
  {
    fetchUser: () => Promise.resolve(null),
    invalidate: () => null,
    logout: () => null,
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

  onMount(async () => {
    await fetchUser();
    setLoaded(true);
  });

  return (
    <SessionContext.Provider value={[state, { invalidate, fetchUser, logout }]}>
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
