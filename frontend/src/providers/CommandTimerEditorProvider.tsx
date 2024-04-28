import { batch, createContext, createSignal, For, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  CommandTimer,
  CustomCommand,
  DeleteCommandTimerReqBody,
  DeleteCustomCommandReqBody,
  PatchCommandTimerReqBody,
  PostCommandTimerReqBody,
} from '#shared/types/api/commands';
import { useNotification } from '#providers/NotificationProvider';
import InputRange from '#components/InputRange';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Button from '#components/Button';
import FormControl from '@suid/material/FormControl/FormControl';
import Select from '@suid/material/Select/Select';
import MenuItem from '@suid/material/MenuItem/MenuItem';
import Modal from '#components/Modal';
import AnchorText from '#components/AnchorText';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { useTemplates } from '#providers/TemplatesProvider';
import { SelectChangeEvent } from '@suid/material/Select';

import style from '#styles/CustomCommandsEditorProvider.module.scss';


export type CommandTimerEditorContextState = {
  open: boolean;
  timer: Partial<CommandTimer>;
};

export type CommandTimerEditorContextValue = [
  state: CommandTimerEditorContextState,
  actions: {
    open: (command?: Partial<CommandTimer>) => void;
    close: () => void;

    updateTimer: (timer: PatchCommandTimerReqBody) => void;
    removeTimer: (timer: CommandTimer) => void;
  }
];

export const defaultState: CommandTimerEditorContextState = {
  open: false,
  timer: {},
};

const CommandTimerEditorContext = createContext<CommandTimerEditorContextValue>([
  defaultState,
  {
    open: () => {
      throw new Error('CommandTimerEditorContext: open() called before provider');
    },
    close: () => {
      throw new Error('CommandTimerEditorContext: close() called before provider');
    },

    updateTimer: (): Promise<boolean> => {
      throw new Error('CommandTimerEditorContext: updateTimer() called before provider');
    },
    removeTimer: (): Promise<boolean> => {
      throw new Error('CommandTimerEditorContext: removeTimer() called before provider');
    },
  },
]);


export const CommandTimerEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();

  const [templates] = useTemplates();

  const [templateId, setTemplateId] = createSignal(-1);


  const open = (command?: Partial<CustomCommand>) => {
    batch(() => {
      if (command?.template) {
        setTemplateId(command.template.id);
      } else {
        setTemplateId(-1);
      }

      setState({
        open: true,
        timer: command ?? {},
      });
    });
  };

  const close = () => {
    batch(() => {
      setTemplateId(-1);

      setState({
        open: false,
        timer: {},
      });
    });
  };

  const createTimer = async (command: PostCommandTimerReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/commands/timers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Command not created',
        message: `An error occurred while creating timer. ${(await response.json()).message}`,
        duration: 10000,
      });
    }

    return response.ok;
  };

  const updateTimer = async (command: PatchCommandTimerReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/commands/timers`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Command not updated',
        message: `An error occurred while updating timer. ${(await response.json()).message}`,
        duration: 10000,
      });
    }

    return response.ok;
  };

  const deleteTimer = async (timer: DeleteCommandTimerReqBody): Promise<boolean> => {
    const body: DeleteCustomCommandReqBody = {
      id: timer.id,
    };

    const response = await fetch(`/api/v1/commands/timers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Timer not deleted',
        message: `An error occurred while deleting timer. ${(await response.json()).message}`,
        duration: 10000,
      });
    }

    return response.ok;
  };

  const removeTimer = async (timer: CommandTimer): Promise<boolean> => {
    openConfirmationBox({
      title: `Delete ${timer.name}`,
      message: 'Are you sure you want to delete this timer?',
      confirmText: 'Delete',
    }).then(async (confirmed) => {
      if (!confirmed) return;

      const ok = await deleteTimer({
        id: timer.id,
      });

      if (ok) {
        addNotification({
          type: 'success',
          title: 'Timer deleted',
          message: `Timer ${timer.name} was successfully deleted.`,
          duration: 5000,
        });
      }

      return ok;
    });

    return false;
  };

  const handleTemplateChange = (ev: SelectChangeEvent) => {
    setTemplateId(ev.target.value as unknown as number);
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const name = ev.target.elements.namedItem('name') as HTMLInputElement;
    const alias = ev.target.elements.namedItem('alias') as HTMLInputElement;
    // const cooldown = ev.target.elements.namedItem('cooldown') as HTMLInputElement;
    const cron = ev.target.elements.namedItem('cron') as HTMLInputElement;
    const lines = ev.target.elements.namedItem('lines') as HTMLInputElement;


    const ok = state.timer.id ?
      await updateTimer({
        id: state.timer.id,
        name: name.value,
        alias: alias.value,
        // cooldown: parseInt(cooldown.value),
        cron: cron.value,
        lines: parseInt(lines.value),
        templateId: templateId(),
      }) :
      await createTimer({
        name: name.value,
        alias: alias.value,
        // cooldown: parseInt(cooldown.value),
        cooldown: 0,
        cron: cron.value,
        lines: parseInt(lines.value),
        templateId: templateId(),
        enabled: true,
      });

    if (ok) {
      const metadata = state.timer.id ? {
        title: 'Timer updated',
        message: `Timer ${name.value} was successfully updated.`,
      } : {
        title: 'Timer created',
        message: `Timer ${name.value} was successfully created.`,
      };

      addNotification({
        type: 'success',
        ...metadata,
        duration: 5000,
      });

      close();
    }
  };


  return (
    <CommandTimerEditorContext.Provider
      value={[
        state,
        {
          open,
          close,
          updateTimer,
          removeTimer,
        },
      ]}
    >
      {props.children}

      <Modal open={state.open} title='Add timer' onClose={() => close()}>
        <form class={style.form} onSubmit={handleForm}>
          <div class={style.group}>
            <InputLabeled label='Name' for='name'>
              <InputBase
                id='name'
                name='name'
                autocomplete='off'
                required
                minLength={1}
                maxLength={32}
                placeholder='Important timer'
                value={state.timer.name ?? ''}
                title='Timer name cannot contain spaces.'
              />
            </InputLabeled>

            <div class={style.description}>
                      Name of the timer, must be between 1 and 32 characters long.
            </div>
          </div>

          <div class={style.group}>
            <InputLabeled label='Alias' for='alias'>
              <InputBase
                id='alias'
                name='alias'
                autocomplete='off'
                required
                minLength={1}
                maxLength={32}
                pattern='^[^\s]+$'
                placeholder='!timer'
                value={state.timer.alias ?? ''}
                title='Alias cannot contain spaces.'
              />
            </InputLabeled>

            <div class={style.description}>
                      Alias of the timer command. It cannot contain spaces and must be between 1 and 32 characters long.
            </div>
          </div>

          <div class={style.group}>
            <InputLabeled label='Cron' for='cron'>
              <InputBase
                id='cron'
                name='cron'
                autocomplete='off'
                required
                minLength={1}
                maxLength={32}
                placeholder='*/20 * * * *'
                value={state.timer.cron ?? ''}
                title='Must be a valid cron expression.'
              />
            </InputLabeled>

            <div class={style.description}>
                      Cron expression for the timer. It must be a valid cron expression.
            </div>
          </div>

          <div class={style.group}>
            <FormControl>
              <InputLabeled label='Template' for='template'>
                <Select
                  labelId='template-label'
                  id='template'
                  name='template'
                  value={templateId()}
                  onChange={handleTemplateChange}
                  required
                >
                  <For each={templates()}>
                    {(template) => (
                      <MenuItem value={template.id}>{template.name}</MenuItem>
                    )}
                  </For>
                </Select>
              </InputLabeled>
            </FormControl>

            <div class={style.description}>
              This is your timer template.
              You can add and edit templates in the <AnchorText href='/dashboard/templates'>Templates</AnchorText> section.
            </div>
          </div>

          {/* <div class={style.group}>
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
                value={state.timer.cooldown ?? '0'}
              />
            </InputLabeled>

            <div class={style.description}>
                      Minimum time between executions of this timer. Set to 0 to disable.
            </div>
          </div> */}

          <div class={style.group}>
            <InputLabeled label='Lines' for='lines'>
              <InputRange
                id='lines'
                name='lines'
                type='range'
                min='0'
                max='1000'
                step='5'
                label='Lines between executions:'
                unit='lines'
                value={state.timer.lines ?? '0'}
              />
            </InputLabeled>

            <div class={style.description}>
                      Minimum time between executions of this timer. Set to 0 to disable.
            </div>
          </div>

          <div class={style.buttons}>
            <Button type='submit' color='primary' symbol='save'>Save</Button>
            <Button type='button' color='gray' onclick={() => close()}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </CommandTimerEditorContext.Provider>);
};

export const useCommandTimerEditor = (): CommandTimerEditorContextValue => useContext(CommandTimerEditorContext);
