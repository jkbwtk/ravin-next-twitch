import DashboardInfoBar from '#components/DashboardInfoBar';
import AdminConfigWidget from '#components/widgets/AdminConfigWidget';
import ChantingSettingsWidget from '#components/widgets/ChantingSettingsWidget';
import { useSession } from '#providers/SessionProvider';
import { Show } from 'solid-js';
import BroadcastSystemNotificationWidget from '#components/widgets/BroadcastSystemNotificationWidget';

import style from '#styles/dashboard/Settings.module.scss';


const Settings: Component = () => {
  const [session] = useSession();
  let containerRef = document.createElement('div');

  return (
    <div class={style.container}>
      <DashboardInfoBar />
      <div ref={containerRef} class={style.widgets}>
        <ChantingSettingsWidget />

        <Show when={session.user?.admin}>
          <AdminConfigWidget />
          <BroadcastSystemNotificationWidget />
        </Show>
      </div>
    </div>
  );
};

export default Settings;
