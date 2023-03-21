import { Component } from 'solid-js';
import DashboardInfoBar from '#components/DashboardInfoBar';
import ModeratorsWidget from '#components/widgets/ModeratorsWidget';
import DashboardPage from '#components/DashboardPage';

import style from '#styles/dashboard/Dashboard.module.scss';


const Dashboard: Component = () => {
  return (
    <DashboardPage>
      <div class={style.container}>
        <DashboardInfoBar />
        <div class={style.widgets}>
          <ModeratorsWidget />
        </div>
      </div>
    </DashboardPage>
  );
};

export default Dashboard;
