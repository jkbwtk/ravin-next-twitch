import DashboardInfoBar from '#components/DashboardInfoBar';
import RegexFiltersTableWidget from '#components/widgets/RegexFiltersTableWidget';

import style from '#styles/dashboard/Filters.module.scss';


const Filters: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.widgets}>
        <RegexFiltersTableWidget />
      </div>
    </div>
  );
};

export default Filters;
