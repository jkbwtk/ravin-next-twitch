import type { Component as SolidComponent } from 'solid-js';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';

import '#styles/index.scss';


// declared it here and not in global.d.ts because typescript was complaining about empty interfaces
// and import.meta.env.DEV was not recognized
declare global {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Component<P = {}> = SolidComponent<P>;
}

const root = document.getElementById('root');

if (root instanceof HTMLElement) {
  render(() =>
    <Router>
      <App />
    </Router>
  , root);

  const updateAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  window.addEventListener('resize', updateAppHeight);
  updateAppHeight();
} else if (import.meta.env.DEV) {
  throw new Error('Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?');
}


