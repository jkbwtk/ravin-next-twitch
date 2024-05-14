import DashboardInfoBar from '#components/DashboardInfoBar';
import BotActionsTableWidget from '#components/widgets/BotActionsTableWidget';

import style from '#styles/dashboard/Logs.module.scss';


const Logs: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.widgets}>
        <BotActionsTableWidget />
      </div>
    </div>
  );
};

export default Logs;
