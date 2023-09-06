import DashboardPage from '#components/DashboardPage';
import DotSpinner from '#components/DotSpinner';
import FetchFallback from '#components/FetchFallback';
import { Outlet, useIsRouting } from '@solidjs/router';
import { Show, Suspense } from 'solid-js';


const DashboardOutlet: Component = () => {
  const isRouting = useIsRouting();

  return (
    <DashboardPage>
      <Show when={!isRouting()}>
        <Suspense fallback={<FetchFallback spinner={DotSpinner}>Loading component</FetchFallback>}>
          <Outlet />
        </Suspense>
      </Show>
    </DashboardPage>
  );
};

export default DashboardOutlet;
