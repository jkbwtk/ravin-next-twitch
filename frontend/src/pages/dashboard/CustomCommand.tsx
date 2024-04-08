import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import { CustomCommandEditorProvider, useCustomCommandEditor } from '#providers/CustomCommandEditorProvider';
import CommandTableWidget from '#components/widgets/CommandTableWidget';

import style from '#styles/dashboard/CustomCommands.module.scss';


const InfoBar: RouteComponent = (props) => {
  const [, { open }] = useCustomCommandEditor();

  return (
    <DashboardInfoBar metadata={props.data?.metadata}>
      <Button color='primary' size='big' onClick={() => open()}>Add Command</Button>
    </DashboardInfoBar>
  );
};

const CustomCommands: RouteComponent = (props) => {
  return (
    <CustomCommandEditorProvider>
      <div class={style.container}>
        <InfoBar {...props} />
        <div class={style.widgets}>
          <CommandTableWidget />
        </div>
      </div>
    </CustomCommandEditorProvider>
  );
};

export default CustomCommands;
