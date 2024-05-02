import DashboardInfoBar from '#components/DashboardInfoBar';
import PhraseFiltersTableWidget from '#components/widgets/PhraseFiltersTableWidget';

import style from '#styles/dashboard/Filters.module.scss';


const Filters: RouteComponent = (props) => {
  return (
    <div class={style.container}>
      <DashboardInfoBar metadata={props.data?.metadata} />
      <div class={style.widgets}>
        <PhraseFiltersTableWidget />
      </div>
    </div>
  );
};

export default Filters;
