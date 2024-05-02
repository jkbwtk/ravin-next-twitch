import Button from '#components/Button';
import DashboardInfoBar from '#components/DashboardInfoBar';
import PhraseFiltersTableWidget from '#components/widgets/PhraseFiltersTableWidget';
import { PhraseFilterEditorProvider, usePhraseFilterEditor } from '#providers/PhraseFilterEditorProvider';

import style from '#styles/dashboard/Filters.module.scss';


const InfoBar: RouteComponent = (props) => {
  const [, { open }] = usePhraseFilterEditor();

  return (
    <DashboardInfoBar metadata={props.data?.metadata}>
      <Button color='primary' size='big' onClick={() => open()}>Add Filter</Button>
    </DashboardInfoBar>
  );
};

const Filters: RouteComponent = (props) => {
  return (
    <PhraseFilterEditorProvider>
      <div class={style.container}>
        <InfoBar {...props} />
        <div class={style.widgets}>
          <PhraseFiltersTableWidget />
        </div>
      </div>
    </PhraseFilterEditorProvider>
  );
};

export default Filters;
