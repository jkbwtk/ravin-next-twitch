import DashboardInfoBar from '#components/DashboardInfoBar';
import ModeratorsWidget from '#components/widgets/ModeratorsWidget';
import DashboardPage from '#components/DashboardPage';
import TopStatsWidget from '#components/widgets/TopStatsWidget';
import RecentActionsWidget from '#components/widgets/RecentActionsWidget';
import StatsWidget from '#components/widgets/StatsWidget';
import ChannelStatus from '#components/ChannelStatus';

import style from '#styles/dashboard/Dashboard.module.scss';


const Dashboard: Component = () => {
  let containerRef = document.createElement('div');

  return (
    <DashboardPage>
      <div class={style.container}>
        <DashboardInfoBar>
          <ChannelStatus />
        </DashboardInfoBar>
        <div ref={containerRef} class={style.widgets}>
          <ModeratorsWidget />
          <StatsWidget containerRef={containerRef} />
          <TopStatsWidget />
          <RecentActionsWidget />
        </div>
      </div>
    </DashboardPage>
  );
};

export default Dashboard;
