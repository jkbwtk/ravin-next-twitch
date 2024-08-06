import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { Match, Switch } from 'solid-js';
import { CommandTimer as CommandTimerType } from '#types/api/commands';
import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { useCommandTimerEditor } from '#providers/CommandTimerEditorProvider';
import { TableCell, TableRow } from '@suid/material';

import style from '#styles/widgets/TableWidget.module.scss';
import { useTemplates } from '#providers/TemplatesProvider';


export type CommandTimerProps = {
  timer: CommandTimerType;
  tableType: TableType;
};

const CommandTimer: Component<CommandTimerProps> = (props) => {
  const [, { open, updateTimer, removeTimer }] = useCommandTimerEditor();
  const [, { getTemplateById }] = useTemplates();

  const toggleEnabled = () => {
    updateTimer({
      id: props.timer.id,
      enabled: !props.timer.enabled,
    });
  };

  return (
    <TableRow>
      <TableCell>{props.timer.name}</TableCell>
      {/* Use class instead classList due to broken reactivity */}
      <TableCell align='left' class={props.tableType > TableType.Full ? style.disabled : ''}>
        {props.timer.alias}
      </TableCell>
      <TableCell>{getTemplateById(props.timer.templateId)?.name}</TableCell>
      <TableCell align='center'>
        <code class={style.noWrap}>
          {props.timer.cron}
        </code>
      </TableCell>
      <TableCell align='right' class={props.tableType > TableType.Compact ? style.disabled : ''}>
        {props.timer.lines}
      </TableCell>

      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={toggleEnabled}>
            <Switch>
              <Match when={props.timer.enabled}>
                <MaterialSymbol symbol='check' color='green' interactive />
              </Match>
              <Match when={!props.timer.enabled}>
                <MaterialSymbol symbol='close' color='gray' interactive />
              </Match>
            </Switch>
          </TemplateButton>
        </div>
      </TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={() => open(props.timer)}>
            <MaterialSymbol symbol='edit' color='yellow' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton onClick={() => removeTimer(props.timer)}>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CommandTimer;
