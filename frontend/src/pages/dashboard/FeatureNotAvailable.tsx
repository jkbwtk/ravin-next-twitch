import DashboardInfoBar from '#components/DashboardInfoBar';
import DashboardPage from '#components/DashboardPage';
import MaterialSymbol from '#components/MaterialSymbol';

import style from '#styles/dashboard/FeatureNotAvailable.module.scss';


const FeatureNotAvailable: Component = () => {
  return (
    <DashboardPage>
      <div class={style.container}>
        <DashboardInfoBar />
        <div class={style.info}>
          <MaterialSymbol symbol='warning' color='primary' class={style.icon} />
          <span class={style.header}>Feature not available</span>
          <span class={style.message}>Please check back later</span>
        </div>
      </div>
    </DashboardPage>
  );
};

export default FeatureNotAvailable;
