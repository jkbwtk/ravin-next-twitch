import { type Component as SolidComponent, type ParentComponent as SolidParentComponent } from 'solid-js';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { NotificationProvider } from '#providers/NotificationProvider';
import { SessionProvider } from '#providers/SessionProvider';
import ThemeProvider from '@suid/material/styles/ThemeProvider';
import { SocketProvider } from '#providers/SocketProvider';
import theme from './suidTheme';
import { StyledEngineProvider } from '@suid/material';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

import '#styles/index.scss';
import 'highlight.js/styles/nord.css';

// declared it here and not in global.d.ts because typescript was complaining about empty interfaces
// and import.meta.env.DEV was not recognized
declare global {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Component<P = {}> = SolidComponent<P>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  type ParentComponent<P = {}> = SolidParentComponent<P>;
}

hljs.registerLanguage('javascript', javascript);

const root = document.getElementById('root');

if (root instanceof HTMLElement) {
  render(() =>
    <StyledEngineProvider cleanupStyles={false}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider>
            <SocketProvider>
              <Router>
                <App />
              </Router>
            </SocketProvider>
          </SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  , root);

  const updateAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  window.addEventListener('resize', updateAppHeight);
  updateAppHeight();
} else if (import.meta.env.DEV) {
  throw new Error('Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?');
}
