import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { Match, Switch } from 'solid-js';
import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { useCommandTimerEditor } from '#providers/CommandTimerEditorProvider';
import { TableCell, TableRow } from '@suid/material';
import { Actions, RegexFilter as RegexFilterType } from '#shared/types/api/filters';
import HighlightedCode from '#components/HighlightedCode';

import style from '#styles/widgets/TableWidget.module.scss';


export type RegexFilterProps = {
  filter: RegexFilterType;
  tableType: TableType;
};

const RegexFilter: Component<RegexFilterProps> = (props) => {
  const [, { open, updateTimer }] = useCommandTimerEditor();

  const toggleEnabled = () => {
    updateTimer({
      id: props.filter.id,
      enabled: !props.filter.enabled,
    });
  };

  return (
    <TableRow>
      <TableCell>
        <HighlightedCode code='/test\s/g' language='cmake' />
      </TableCell>
      <TableCell align='center'>
        <code>
          {Actions[props.filter.action]}
        </code>
      </TableCell>
      {/* Use class instead classList due to broken reactivity */}
      <TableCell class={props.tableType > TableType.Compact ? style.disabled : ''}>
        {props.filter.reason}
      </TableCell>

      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={toggleEnabled}>
            <Switch>
              <Match when={props.filter.enabled}>
                <MaterialSymbol symbol='check' color='green' interactive />
              </Match>
              <Match when={!props.filter.enabled}>
                <MaterialSymbol symbol='close' color='gray' interactive />
              </Match>
            </Switch>
          </TemplateButton>
        </div>
      </TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={() => open(props.filter)}>
            <MaterialSymbol symbol='edit' color='yellow' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RegexFilter;
