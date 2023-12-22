import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';
import { Template as TemplateType } from '#shared/types/api/templates';

import style from '#styles/widgets/CommandTableWidget.module.scss';


export type TemplateProps = {
  template: TemplateType;
  openEditor: (template: Partial<TemplateType>) => void;
  deleteTemplate: (template: TemplateType) => void;
};

const Template: Component<TemplateProps> = (props) => {
  return (
    <TableRow>
      <TableCell align='left'>{props.template.name}</TableCell>
      <TableCell align='left'><code>{props.template.template}</code></TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton>
            <MaterialSymbol symbol='settings_backup_restore' color='green' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton onClick={() => props.openEditor(props.template)}>
            <MaterialSymbol symbol='edit' color='yellow' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton onClick={() => props.deleteTemplate(props.template)}>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Template;
