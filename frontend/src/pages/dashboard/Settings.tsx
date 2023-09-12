import DashboardInfoBar from '#components/DashboardInfoBar';
import ChantingSettingsWidget from '#components/widgets/ChantingSettingsWidget';

import style from '#styles/dashboard/Settings.module.scss';


const Settings: Component = () => {
  let containerRef = document.createElement('div');

  return (
    <div class={style.container}>
      <DashboardInfoBar />
      <div ref={containerRef} class={style.widgets}>
        <ChantingSettingsWidget />
      </div>
    </div>
  );
};

export default Settings;
