import { createContext, createSignal, onCleanup, onMount, ParentComponent, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import DotSpinner from '#components/DotSpinner';
import { Manager, Socket } from 'socket.io-client';

import style from '#styles/SessionProvider.module.scss';
import { useSession } from '#providers/SessionProvider';


export type SocketContextState = {
  manager: Manager;
  client: Socket;
};

export type SocketContextValue = [
  state: SocketContextState,
  actions: object,
];

const defaultState: SocketContextState = {
  client: {} as Socket,
  manager: new Manager(),
};

const SocketContext = createContext<SocketContextValue>([
  defaultState,
  {

  },
]);

export const SocketProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultState);
  const [session] = useSession();
  const [loaded, setLoaded] = createSignal(false);

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
  };

  onMount(async () => {
    if (session.loggedIn) {
      setState('client', state.manager.socket('/'));
      registerSocketEvents();
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
