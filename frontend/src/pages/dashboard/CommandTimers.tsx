import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import { CommandTimerEditorProvider, useCommandTimerEditor } from '#providers/CommandTimerEditorProvider';
import CommandTimersTableWidget from '#components/widgets/CommandTimersTableWidget';

import style from '#styles/dashboard/CommandTimers.module.scss';


const InfoBar: RouteComponent = (props) => {
  const [, { open }] = useCommandTimerEditor();

  return (
    <DashboardInfoBar metadata={props.data?.metadata}>
      <Button color='primary' size='big' onClick={() => open()}>Add Timer</Button>
    </DashboardInfoBar>
  );
};

const CommandTimers: RouteComponent = (props) => {
  return (
    <CommandTimerEditorProvider>
      <div class={style.container}>
        <InfoBar {...props} />
        <div class={style.widgets}>
          <CommandTimersTableWidget />
        </div>
      </div>
    </CommandTimerEditorProvider>
  );
};

export default CommandTimers;
