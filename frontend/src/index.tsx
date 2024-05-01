import { type Component as SolidComponent, type ParentComponent as SolidParentComponent } from 'solid-js';
import { render } from 'solid-js/web';
import { NotificationProvider } from '#providers/NotificationProvider';
import { SessionProvider } from '#providers/SessionProvider';
import ThemeProvider from '@suid/material/styles/ThemeProvider';
import { SocketProvider } from '#providers/SocketProvider';
import theme from './suidTheme';
import { StyledEngineProvider } from '@suid/material';
import AppRouter from '#routers/AppRouter';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { RouteSectionProps } from '@solidjs/router';
import { OptionalRouteMetadata } from '#routers/utils';
import { ConfirmationBoxProvider } from '#providers/ConfirmationBoxProvider';
import { ErrorHandlersProvider } from '#providers/ErrorHandlersProvider';

import '#styles/index.scss';
import 'highlight.js/styles/nord.css';

// declared it here and not in global.d.ts because typescript was complaining about empty interfaces
// and import.meta.env.DEV was not recognized
declare global {
  type Component<P extends object = {}> = SolidComponent<P>;

  type ParentComponent<P extends object = {}> = SolidParentComponent<P>;

  type RouteComponent<P extends object = {}, D extends object = {}> = SolidParentComponent<P & RouteSectionProps<D & OptionalRouteMetadata>>;
}

hljs.registerLanguage('javascript', javascript);

const root = document.getElementById('root');

if (root instanceof HTMLElement) {
  render(() =>
    (
      <StyledEngineProvider cleanupStyles={false}>
        <ThemeProvider theme={theme}>
          <NotificationProvider>
            <SessionProvider>
              <SocketProvider>
                <ConfirmationBoxProvider>
                  <ErrorHandlersProvider>
                    <AppRouter />
                  </ErrorHandlersProvider>
                </ConfirmationBoxProvider>
              </SocketProvider>
            </SessionProvider>
          </NotificationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    )
  , root);

  const updateAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  window.addEventListener('resize', updateAppHeight);
  updateAppHeight();
} else if (import.meta.env.DEV) {
  throw new Error('Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?');
}
