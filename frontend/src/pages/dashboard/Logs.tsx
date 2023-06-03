import DashboardPage from '#components/DashboardPage';
import DashboardInfoBar from '#components/DashboardInfoBar';
import LogsWidget from '#components/widgets/LogsWidget';

import style from '#styles/dashboard/Logs.module.scss';


const Logs: Component = () => {
  return (
    <DashboardPage>
      <div class={style.container}>
        <DashboardInfoBar />
        <div class={style.widgets}>
          <LogsWidget />
        </div>
      </div>
    </DashboardPage>
  );
};

export default Logs;
