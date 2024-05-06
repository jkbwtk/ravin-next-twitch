import Button from '#components/Button';
import DashboardInfoBar from '#components/DashboardInfoBar';
import RegexFiltersTableWidget from '#components/widgets/RegexFiltersTableWidget';
import { RegexFilterEditorProvider, useRegexFilterEditor } from '#providers/RegexFilterEditorProvider';

import style from '#styles/dashboard/Filters.module.scss';


const InfoBar: RouteComponent = (props) => {
  const [, { open }] = useRegexFilterEditor();

  return (
    <DashboardInfoBar metadata={props.data?.metadata}>
      <Button color='primary' size='big' onClick={() => open()}>Add Filter</Button>
    </DashboardInfoBar>
  );
};

const Filters: RouteComponent = (props) => {
  return (
    <RegexFilterEditorProvider>
      <div class={style.container}>
        <InfoBar {...props} />
        <div class={style.widgets}>
          <RegexFiltersTableWidget />
        </div>
      </div>
    </RegexFilterEditorProvider>
  );
};

export default Filters;
