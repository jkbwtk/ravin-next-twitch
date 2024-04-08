import DashboardInfoBar from '#components/DashboardInfoBar';
import ChantingSettingsWidget from '#components/widgets/ChantingSettingsWidget';

import style from '#styles/dashboard/Settings.module.scss';


const Settings: RouteComponent = (props) => {
  let containerRef = document.createElement('div');

  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div ref={containerRef} class={style.widgets}>
        <ChantingSettingsWidget />
      </div>
    </div>
  );
};

export default Settings;
