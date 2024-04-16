import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import TableRow from '@suid/material/TableRow/TableRow';
import TableCell from '@suid/material/TableCell/TableCell';
import { environmentAbbreviationMap, Template as TemplateType } from '#shared/types/api/templates';
import HighlightedCode from '#components/HighlightedCode';
import { For } from 'solid-js';
import Pill from '#components/Pill';

import style from '#styles/widgets/TableWidget.module.scss';


export type TemplateProps = {
  template: TemplateType;
  openEditor: (template: TemplateType | null) => void;
  deleteTemplate: (template: TemplateType) => void;
};


const Template: Component<TemplateProps> = (props) => {
  return (
    <TableRow>
      <TableCell align='left'>{props.template.name}</TableCell>
      <TableCell align='left'>
        <HighlightedCode code={props.template.template} language='javascript' wrap='`' />
      </TableCell>
      <TableCell align='center'>
        <div class={style.pillContainer}>
          <For each={[...props.template.environments, ...props.template.environments]}>
            {(env) => <Pill class={style.pill} content={environmentAbbreviationMap[env] ?? env.slice(0, 3)} />}
          </For>
        </div>
      </TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
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
