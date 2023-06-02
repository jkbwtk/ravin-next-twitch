import DashboardPage from '#components/DashboardPage';
import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import { CustomCommandEditorProvider, useCustomCommandEditor } from '#providers/CustomCommandEditorProvider';
import CommandTableWidget from '#components/widgets/CommandTableWidget';

import style from '#styles/dashboard/CustomCommands.module.scss';


const InfoBar: Component = () => {
  const [, { open }] = useCustomCommandEditor();

  return (
    <DashboardInfoBar>
      <Button color='primary' size='big' onClick={() => open()}>Add Command</Button>
    </DashboardInfoBar>
  );
};

const CustomCommands: Component = () => {
  return (
    <DashboardPage>
      <CustomCommandEditorProvider>
        <div class={style.container}>
          <InfoBar />
          <div class={style.widgets}>
            <CommandTableWidget />
          </div>
        </div>
      </CustomCommandEditorProvider>
    </DashboardPage>
  );
};

export default CustomCommands;
