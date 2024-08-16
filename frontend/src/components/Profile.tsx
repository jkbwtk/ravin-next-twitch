import { TableType } from '#components/widgets/CommandTimersTableWidget';
import { TableCell, TableRow } from '@suid/material';
import { BehaviorProfileApi } from '#types/api/behaviorProfiles';
import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { Match, Switch } from 'solid-js';
import HighlightedCode from '#components/HighlightedCode';
import { useBehaviorProfilesEditor } from '#providers/BehaviorProfilesEditorProvider';

import style from '#styles/widgets/TableWidget.module.scss';


export type ProfileProps = {
  profile: BehaviorProfileApi;
  tableType: TableType;
};

const Profile: Component<ProfileProps> = (props) => {
  const [, { updateProfile, open }] = useBehaviorProfilesEditor();

  const toggleEnabled = async () => {
    await updateProfile(props.profile.id, { enabled: !props.profile.enabled });
  };

  const toggleActivation = async () => {
    await updateProfile(props.profile.id, { manuallyActivated: !props.profile.manuallyActivated });
  };

  const removeCommand = (profile: BehaviorProfileApi) => {
    console.log(profile);
  };

  return (
    <TableRow>
      <TableCell class={style.minWidthColumn}>{props.profile.name}</TableCell>
      <TableCell>
        <HighlightedCode code={props.profile.activatorTitle ?? ''} language='cmake' />
      </TableCell>
      <TableCell>
        <HighlightedCode code={props.profile.activatorCategory ?? ''} language='cmake' />
      </TableCell>
      <TableCell class={props.tableType > TableType.Full ? style.disabled : ''}>
        {props.profile.description}
      </TableCell>

      <TableCell align='center' class={style.minWidthColumn}>
        <div>
          <TemplateButton onClick={toggleActivation}>
            <Switch>
              <Match when={props.profile.manuallyActivated}>
                <MaterialSymbol symbol='check' color='green' interactive />
              </Match>
              <Match when={!props.profile.manuallyActivated}>
                <MaterialSymbol symbol='close' color='gray' interactive />
              </Match>
            </Switch>
          </TemplateButton>
        </div>
      </TableCell>

      <TableCell align='center' class={style.minWidthColumn}>
        <div>
          <TemplateButton onClick={toggleEnabled}>
            <Switch>
              <Match when={props.profile.enabled}>
                <MaterialSymbol symbol='check' color='green' interactive />
              </Match>
              <Match when={!props.profile.enabled}>
                <MaterialSymbol symbol='close' color='gray' interactive />
              </Match>
            </Switch>
          </TemplateButton>
        </div>
      </TableCell>
      <TableCell align='center'>
        <div class={style.actionsContainer}>
          <TemplateButton onClick={() => open(props.profile)}>
            <MaterialSymbol symbol='edit' color='yellow' size='alt' interactive class={style.commandButton} />
          </TemplateButton>

          <TemplateButton onClick={() => removeCommand(props.profile) }>
            <MaterialSymbol symbol='delete' color='red' size='alt' interactive class={style.commandButton} />
          </TemplateButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Profile;
