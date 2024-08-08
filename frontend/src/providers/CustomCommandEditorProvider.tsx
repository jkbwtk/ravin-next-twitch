import { batch, createContext, createSignal, For, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  CustomCommandApi,
  PatchCustomCommandReqBody,
  PostCustomCommandReqBody,
  UserLevel,
  UserLevelsArray,
} from '#types/api/commands';
import { useNotification } from '#providers/NotificationProvider';
import InputRange from '#components/InputRange';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Button from '#components/Button';
import FormControl from '@suid/material/FormControl/FormControl';
import Select from '@suid/material/Select/Select';
import MenuItem from '@suid/material/MenuItem/MenuItem';
import { SelectChangeEvent } from '@suid/material/Select';
import Modal from '#components/Modal';
import AnchorText from '#components/AnchorText';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { useTemplates } from '#providers/TemplatesProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';
import { userLevels } from '#locales/en-us/commands';
import TemplateMenuItems from '#components/TemplateMenuItems';
import { TemplateEnvironments } from '#types/database/columns';

import style from '#styles/CustomCommandsEditorProvider.module.scss';


export const translateUserLevel = (userLevel: UserLevel): keyof typeof UserLevel => UserLevel[userLevel] as keyof typeof UserLevel;

export type CustomCommandEditorContextState = {
  open: boolean;
  command: Partial<CustomCommandApi>;
};

export type CustomCommandEditorContextValue = [
  state: CustomCommandEditorContextState,
  actions: {
    open: (command?: Partial<CustomCommandApi>) => void;
    close: () => void;

    updateCommand: (id: number, command: PatchCustomCommandReqBody) => void;
    removeCommand: (command: CustomCommandApi) => void;
  }
];

export const defaultState: CustomCommandEditorContextState = {
  open: false,
  command: {},
};

const CustomCommandEditorContext = createContext<CustomCommandEditorContextValue>([
  defaultState,
  {
    open: () => {
      throw new Error('CustomCommandEditorContext: open() called before provider');
    },
    close: () => {
      throw new Error('CustomCommandEditorContext: close() called before provider');
    },

    updateCommand: (): Promise<boolean> => {
      throw new Error('CustomCommandEditorContext: updateCommand() called before provider');
    },
    removeCommand: (): Promise<boolean> => {
      throw new Error('CustomCommandEditorContext: removeCommand() called before provider');
    },
  },
]);


export const CustomCommandEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();
  const { popupApiError } = useErrorHandlers();

  const [templates] = useTemplates();

  const [template, setTemplate] = createSignal(-1);
  const [userLevel, setUserLevel] = createSignal(state.command.userLevel ?? UserLevel['Everyone']);


  const open = (command?: Partial<CustomCommandApi>) => {
    batch(() => {
      setState({
        open: true,
        command: command ?? {},
      });

      setTemplate(command?.templateId ?? -1);
    });
  };

  const close = () => {
    batch(() => {
      setState(structuredClone(defaultState));
      setTemplate(-1);
    });
  };

  const createCommand = async (command: PostCustomCommandReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/commands/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      await popupApiError(response, {
        title: 'Command not created',
        action: 'creating command',
      });
    }

    return response.ok;
  };

  const updateCommand = async (id: number, command: PatchCustomCommandReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/commands/custom/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      await popupApiError(response, {
        title: 'Command not updated',
        action: 'updating command',
      });
    }

    return response.ok;
  };

  const deleteCommand = async (id: number): Promise<boolean> => {
    const response = await fetch(`/api/v1/commands/custom/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await popupApiError(response, {
        title: 'Command not deleted',
        action: 'deleting command',
      });
    }

    return response.ok;
  };

  const removeCommand = async (command: CustomCommandApi): Promise<boolean> => {
    const confirmed = await openConfirmationBox({
      title: `Delete ${command.command}`,
      message: 'Are you sure you want to delete this command?',
      confirmText: 'Delete',
    });

    if (!confirmed) return false;

    const ok = await deleteCommand(command.id);

    if (ok) {
      addNotification({
        type: 'success',
        title: 'Command deleted',
        message: `The command ${command.command} was successfully deleted.`,
        duration: 5000,
      });
    }

    return ok;
  };

  const handleTemplateChange = (ev: SelectChangeEvent) => {
    setTemplate(ev.target.value as unknown as number);
  };

  const handleUserStatusChange = (ev: SelectChangeEvent) => {
    setUserLevel(ev.target.value as unknown as UserLevel);
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const command = ev.target.elements.namedItem('command') as HTMLInputElement;
    const cooldown = ev.target.elements.namedItem('cooldown') as HTMLInputElement;

    if (state.command.id) {
      await updateCommand(state.command.id, {
        command: command.value,
        templateId: template(),
        cooldown: parseInt(cooldown.value),
        userLevel: userLevel(),
      });
    } else {
      await createCommand({
        command: command.value,
        templateId: template()!,
        cooldown: parseInt(cooldown.value),
        userLevel: userLevel(),
        enabled: true,
      });
    }

    close();
  };


  return (
    <CustomCommandEditorContext.Provider
      value={[
        state,
        {
          open,
          close,
          updateCommand,
          removeCommand,
        },
      ]}
    >
      {props.children}

      <Modal open={state.open} title='Add command' onClose={() => close()}>
        <form class={style.form} onSubmit={handleForm}>
          <div class={style.group}>
            <InputLabeled label='Command' for='command'>
              <InputBase
                id='command'
                name='command'
                autocomplete='off'
                required
                minLength={1}
                maxLength={32}
                pattern='^[^\s]+$'
                placeholder='!command'
                value={state.command.command ?? ''}
                title='Command name cannot contain spaces.'
              />
            </InputLabeled>

            <div class={style.description}>
                      Name of the command. It cannot contain spaces and must be between 1 and 32 characters long.
            </div>
          </div>

          <div class={style.group}>
            <FormControl>
              <InputLabeled label='Template' for='template'>
                <Select
                  labelId='template-label'
                  id='template'
                  name='template'
                  value={template()}
                  onChange={handleTemplateChange}
                  required
                >
                  <TemplateMenuItems templates={templates()} compatibleEnvironment={TemplateEnvironments.Enum.command} />
                </Select>
              </InputLabeled>
            </FormControl>

            <div class={style.description}>
              This is your command template.
              You can add and edit templates in the <AnchorText href='/dashboard/templates'>Templates</AnchorText> section.
            </div>
          </div>

          <div class={style.group}>
            <InputLabeled label='Cooldown' for='cooldown'>
              <InputRange
                id='cooldown'
                name='cooldown'
                type='range'
                min='0'
                max='1440'
                step='5'
                label='Cooldown between uses:'
                unit='seconds'
                value={state.command.cooldown ?? '0'}
              />
            </InputLabeled>

            <div class={style.description}>
                      Minimum time between uses of this command. Set to 0 to disable.
            </div>
          </div>

          <div class={style.group}>
            <FormControl>
              <InputLabeled label='User level' for='user-level'>
                <Select
                  labelId='user-level-label'
                  id='user-level'
                  name='user-level'
                  value={userLevel()}
                  onChange={handleUserStatusChange}
                  required
                >
                  <For each={UserLevelsArray}>
                    {(level) => <MenuItem value={level}>{userLevels.get(level)}</MenuItem>}
                  </For>
                </Select>
              </InputLabeled>
            </FormControl>

            <div class={style.description}>
                      Minimum user level required to use this command.
                      Permissions are hierarchical, so a VIP can use a command that requires a Subscriber, but not the other way around.
            </div>
          </div>

          <div class={style.buttons}>
            <Button type='submit' color='primary' symbol='save'>Save</Button>
            <Button type='button' color='gray' onclick={() => close()}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </CustomCommandEditorContext.Provider>);
};

export const useCustomCommandEditor = (): CustomCommandEditorContextValue => useContext(CustomCommandEditorContext);
