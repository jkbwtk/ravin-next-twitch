import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { TableCell, TableRow } from '@suid/material';
import { BotActionApi } from '#types/api/botActions';
import { botActions, botActionsDescriptions } from '#locales/en-us/botActions';

import style from '#styles/widgets/TableWidget.module.scss';


export type BotActionProps = {
  log: BotActionApi;
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
