import DashboardInfoBar from '#components/DashboardInfoBar';
import AdminConfigWidget from '#components/widgets/AdminConfigWidget';
import AdminPublicConfigWidget from '#components/widgets/AdminPublicConfigWidget';
import BroadcastSystemNotificationWidget from '#components/widgets/BroadcastSystemNotificationWidget';
import ScheduledJobsWidget from '#components/widgets/ScheduledJobsWidget';

import style from '#styles/dashboard/Admin.module.scss';


const Logs: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.widgets}>
        <AdminPublicConfigWidget />
        <BroadcastSystemNotificationWidget />
        <AdminConfigWidget />
        <ScheduledJobsWidget />
      </div>
    </div>
  );
};

export default Logs;
