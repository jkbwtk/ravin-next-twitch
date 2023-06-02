import { createContext, createSignal, onCleanup, onMount, ParentComponent, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import DotSpinner from '#components/DotSpinner';
import { Manager, Socket } from 'socket.io-client';
import { useSession } from '#providers/SessionProvider';
import { ClientToServerEvents, ServerToClientEvents } from '#types/api/socket';

import style from '#styles/SessionProvider.module.scss';


export type SocketContextState = {
  manager: Manager;
  client: Socket<ServerToClientEvents, ClientToServerEvents>;
};

export type SocketContextValue = [
  state: SocketContextState,
  actions: {
    emit: SocketContextState['client']['emit'];
  },
];

const defaultState: SocketContextState = {
  client: {} as Socket,
  manager: new Manager(),
};

const SocketContext = createContext<SocketContextValue>([
  defaultState,
  {
    emit: () => null as unknown as Socket,
  },
]);

export const SocketProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);
  const [session, { pushNotification, setNotificationsAsRead }] = useSession();
  const [loaded, setLoaded] = createSignal(false);

  const emit: SocketContextState['client']['emit'] = (event, ...args) => {
    return state.client.emit(event, ...args);
  };

  const registerSocketEvents = () => {
    state.client.on('connect', () => {
      console.log('Socket connected');
    });

    state.client.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    state.client.on('connect_error', (err) => {
      console.error(err);
    });

    state.client.onAny((event, ...message) => {
      console.log(event, message);
    });
  };

  const registerEventHandlers = () => {
    state.client.on('NEW_SYSTEM_NOTIFICATION', (notification) => {
      notification.createdAt = new Date(notification.createdAt);

      pushNotification(notification);
    });

    state.client.on('RAD_SYSTEM_NOTIFICATION', setNotificationsAsRead);
  };

  onMount(async () => {
    if (session.loggedIn) {
      setState('client', state.manager.socket('/'));
      registerSocketEvents();
      registerEventHandlers();
    }

    setLoaded(true);
  });

  onCleanup(() => {
    if (session.loggedIn) {
      state.client.disconnect();
    }
  });

  return (
    <SocketContext.Provider value={[state, {
      emit,
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
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => useContext(SocketContext);
