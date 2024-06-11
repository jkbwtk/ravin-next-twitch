import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { TableCell, TableRow } from '@suid/material';
import { BotAction as BotActionType } from '#types/api/botActions';
import { botActions, botActionsDescriptions } from '#locales/en-us/botActions';

import style from '#styles/widgets/TableWidget.module.scss';


export type BotActionProps = {
  log: BotActionType;
  tableType: TableType;
};

const BotAction: Component<BotActionProps> = (props) => {
  return (
    <TableRow>
      <TableCell class={style.minWidthColumn}>{botActions.get(props.log.type)}</TableCell>
      <TableCell>{botActionsDescriptions.get(props.log.type)(props.log.data)}</TableCell>

      <TableCell align='center' class={style.minWidthColumn}>
        {new Date(props.log.timestamp).toLocaleString()}
      </TableCell>
    </TableRow>
  );
};

export default BotAction;
