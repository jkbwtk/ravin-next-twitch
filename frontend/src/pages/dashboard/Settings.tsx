import DashboardInfoBar from '#components/DashboardInfoBar';
import DashboardPage from '#components/DashboardPage';
import ChantingSettingsWidget from '#components/widgets/ChantingSettingsWidget';

import style from '#styles/dashboard/Settings.module.scss';


const Settings: Component = () => {
  let containerRef = document.createElement('div');

  return (
    <DashboardPage>
      <div class={style.container}>
        <DashboardInfoBar />
        <div ref={containerRef} class={style.widgets}>
          <ChantingSettingsWidget />
        </div>
      </div>
    </DashboardPage>
  );
};

export default Settings;
