import DashboardInfoBar from '#components/DashboardInfoBar';
import AdminConfigWidget from '#components/widgets/AdminConfigWidget';
import BroadcastSystemNotificationWidget from '#components/widgets/BroadcastSystemNotificationWidget';
import ScheduledJobsWidget from '#components/widgets/ScheduledJobsWidget';

import style from '#styles/dashboard/Admin.module.scss';


const Logs: Component = () => {
  return (
    <div class={style.container}>
      <DashboardInfoBar />
      <div class={style.widgets}>
        <AdminConfigWidget />
        <BroadcastSystemNotificationWidget />
        <ScheduledJobsWidget />
      </div>
    </div>
  );
};

export default Logs;
