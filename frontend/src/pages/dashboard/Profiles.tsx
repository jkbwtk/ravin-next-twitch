import DashboardInfoBar from '#components/DashboardInfoBar';
import ProfilesTableWidget from '#components/widgets/ProfilesTableWidget';

import style from '#styles/dashboard/Profiles.module.scss';


const Profiles: RouteComponent = (props) => {
  let containerRef = document.createElement('div');

  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div ref={containerRef} class={style.widgets}>
        <ProfilesTableWidget />
      </div>
    </div>
  );
};

export default Profiles;
