import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { Match, Switch } from 'solid-js';
import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { useCommandTimerEditor } from '#providers/CommandTimerEditorProvider';
import { TableCell, TableRow } from '@suid/material';
import { Actions, PhraseFilter as PhraseFilterType } from '#shared/types/api/filters';

import style from '#styles/widgets/TableWidget.module.scss';


export type PhraseFilterProps = {
  filter: PhraseFilterType;
  tableType: TableType;
};

const PhraseFilter: Component<PhraseFilterProps> = (props) => {
  const [, { open, updateTimer }] = useCommandTimerEditor();

  const toggleEnabled = () => {
    updateTimer({
      id: props.filter.id,
      enabled: !props.filter.enabled,
    });
  };

  return (
    <TableRow>
      <TableCell>{props.filter.phrase}</TableCell>
      <TableCell align='right'>{props.filter.similarity}</TableCell>
      <TableCell align='right' class={props.tableType > TableType.Full ? style.disabled : ''}>
        <div class={style.actionsContainer}>
          <Switch>
            <Match when={props.filter.caseSensitive}>
              <MaterialSymbol symbol='check' color='green' />
            </Match>
            <Match when={!props.filter.caseSensitive}>
              <MaterialSymbol symbol='close' color='gray' />
            </Match>
          </Switch>
        </div>
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

export default PhraseFilter;
