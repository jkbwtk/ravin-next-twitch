import DashboardInfoBar from '#components/DashboardInfoBar';
import MaterialSymbol from '#components/MaterialSymbol';

import style from '#styles/dashboard/FeatureNotAvailable.module.scss';


const FeatureNotAvailable: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.info}>
        <MaterialSymbol symbol='warning' color='primary' class={style.icon} />
        <span class={style.header}>Feature not available</span>
        <span class={style.message}>Please check back later</span>
      </div>
    </div>
  );
};

export default FeatureNotAvailable;
