import type { Component as SolidComponent, ParentComponent as SolidParentComponent } from 'solid-js';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { NotificationProvider } from '#providers/NotificationProvider';
import { SessionProvider } from '#providers/SessionProvider';

import '#styles/index.scss';
import { SocketProvider } from '#providers/SocketProvider';


// declared it here and not in global.d.ts because typescript was complaining about empty interfaces
// and import.meta.env.DEV was not recognized
declare global {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Component<P = {}> = SolidComponent<P>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  type ParentComponent<P = {}> = SolidParentComponent<P>;
}

const root = document.getElementById('root');

if (root instanceof HTMLElement) {
  render(() =>
    <NotificationProvider>
      <SessionProvider>
        <SocketProvider>
          <Router>
            <App />
          </Router>
        </SocketProvider>
      </SessionProvider>
    </NotificationProvider>
  , root);

  const updateAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  window.addEventListener('resize', updateAppHeight);
  updateAppHeight();
} else if (import.meta.env.DEV) {
  throw new Error('Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?');
}
