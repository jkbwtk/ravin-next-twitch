import DashboardInfoBar from '#components/DashboardInfoBar';
import LogsWidget from '#components/widgets/LogsWidget';

import style from '#styles/dashboard/Logs.module.scss';


const Logs: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.widgets}>
        <LogsWidget />
      </div>
    </div>
  );
};

export default Logs;
