import DashboardPage from '#components/DashboardPage';
import { Outlet } from '@solidjs/router';


const DashboardOutlet: Component = () => {
  return (
    <DashboardPage>
      <Outlet />
    </DashboardPage>
  );
};

export default DashboardOutlet;
