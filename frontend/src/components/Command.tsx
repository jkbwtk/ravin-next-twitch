import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { translateUserLevel, useCustomCommandEditor } from '#providers/CustomCommandEditorProvider';
import { Match, Switch } from 'solid-js';
import { CustomCommand } from '#shared/types/api/commands';
import { TableType } from '#components/widgets/CommandTableWidget';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';

import style from '#styles/widgets/TableWidget.module.scss';


export type CommandProps = {
  command: CustomCommand;
  tableType: TableType;
};

const Command: Component<CommandProps> = (props) => {
  const [, { open, updateCommand, removeCommand }] = useCustomCommandEditor();

  const toggleEnabled = () => {
    updateCommand({
      id: props.command.id,
      enabled: !props.command.enabled,
    });
  };

  return (
    <TableRow>
      <TableCell align='left'>{props.command.command}</TableCell>
      <TableCell align='left'>{props.command.template.name}</TableCell>
      {/* Use class instead classList due to broken reactivity */}
      <TableCell class={props.tableType > TableType.Full ? style.disabled : ''}>
        {translateUserLevel(props.command.userLevel)}
      </TableCell>
      <TableCell align='right' class={props.tableType > TableType.Compact ? style.disabled : ''}>
        {props.command.cooldown}s
      </TableCell>
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

          <TemplateButton onClick={() => removeCommand(props.command) }>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Command;
