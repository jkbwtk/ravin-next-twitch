import MaterialSymbol from '#components/MaterialSymbol';
import { TemplateApi, TemplateEnvironments } from '#types/api/templates';
import { MenuItem } from '@suid/material';
import { For, Show } from 'solid-js';

import style from '#styles/TemplateMenuItems.module.scss';


export type TemplateMenuItemsProps = {
  templates: TemplateApi[];
  compatibleEnvironment: TemplateEnvironments;
};

const TemplateMenuItems: Component<TemplateMenuItemsProps> = (props) => {
  const isCompatible = (template: TemplateApi) => template.environments.includes(props.compatibleEnvironment);

  const sortedTemplates = () => props.templates.toSorted((a, b) => {
    if (isCompatible(a) && !isCompatible(b)) {
      return -1;
    } else if (!isCompatible(a) && isCompatible(b)) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <For each={sortedTemplates()}>
      {(template) => (
        <MenuItem value={template.id} class={style.entry} disabled={!isCompatible(template)}>
          <Show when={!isCompatible(template)}>
            <MaterialSymbol symbol='warning' color='red' size='alt' interactive />
          </Show>

          {template.name}
        </MenuItem>
      )}
    </For>
  );
};

export default TemplateMenuItems;
