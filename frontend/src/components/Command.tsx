import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { translateUserLevel, useCustomCommandEditor } from '#providers/CustomCommandEditorProvider';
import { Match, Switch } from 'solid-js';
import { CustomCommand } from '#shared/types/api/commands';
import { TableType } from '#components/widgets/CommandTableWidget';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';

import style from '#styles/widgets/CommandTableWidget.module.scss';


export type CommandProps = {
  command: CustomCommand;
  tableType: TableType;
};

const Command: Component<CommandProps> = (props) => {
  const [editor, { open, updateCommand, deleteCommand }] = useCustomCommandEditor();

  const toggleEnabled = () => {
    updateCommand({
      id: props.command.id,
      enabled: !props.command.enabled,
    });
  };

  return (
    <TableRow>
      <TableCell align='left'>{props.command.command}</TableCell>
      <TableCell align='left'>{editor.templates.find((t) => t.id === props.command.templateId)?.name}</TableCell>
      <TableCell classList={{
        [style.disabled]: props.tableType > TableType.Full,
      }}>{translateUserLevel(props.command.userLevel)}</TableCell>
      <TableCell align='right' classList={{
        [style.disabled]: props.tableType > TableType.Compact,
      }}>{props.command.cooldown}s</TableCell>
      <TableCell align='center'>
        <div>
          <TemplateButton onClick={toggleEnabled}>
            <Switch>
              <Match when={props.command.enabled}>
                <MaterialSymbol symbol='check' color='green' interactive />
              </Match>
              <Match when={!props.command.enabled}>
                <MaterialSymbol symbol='close' color='gray' interactive />
              </Match>
            </Switch>
          </TemplateButton>
        </div>
      </TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={() => open(props.command)}>
            <MaterialSymbol symbol='edit' color='yellow' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton onClick={() => deleteCommand(props.command) }>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Command;
