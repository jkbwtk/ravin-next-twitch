import { createContext, createEffect, createResource, createSignal, For, onCleanup, onMount, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { CustomCommand, DeleteCustomCommandReqBody, PatchCustomCommandReqBody, PostCustomCommandReqBody, UserLevel } from '#shared/types/api/commands';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';
import TemplateButton from '#components/TemplateButton';
import MaterialSymbol from '#components/MaterialSymbol';
import { useNotification } from '#providers/NotificationProvider';
import InputRange from '#components/InputRange';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Button from '#components/Button';
import FormControl from '@suid/material/FormControl/FormControl';
import Select from '@suid/material/Select/Select';
import MenuItem from '@suid/material/MenuItem/MenuItem';
import { SelectChangeEvent } from '@suid/material/Select';
import { GetTemplatesResponse, Template } from '#shared/types/api/templates';
import { makeRequest } from '#lib/fetch';
import { useSocket } from '#providers/SocketProvider';

import style from '#styles/CustomCommandsEditorProvider.module.scss';


export const translateUserLevel = (userLevel: UserLevel): keyof typeof UserLevel => UserLevel[userLevel] as keyof typeof UserLevel;

export type CustomCommandEditorContextState = {
  open: boolean;
  command: Partial<CustomCommand>;
  templates: Template[];
};

export type CustomCommandEditorContextValue = [
  state: CustomCommandEditorContextState,
  actions: {
    open: (command?: Partial<CustomCommand>) => void;
    close: () => void;

    updateCommand: (command: PatchCustomCommandReqBody) => void;
    deleteCommand: (command: CustomCommand) => void;
  }
];

export const defaultState: CustomCommandEditorContextState = {
  open: false,
  command: {},
  templates: [],
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

    updateCommand: () => {
      throw new Error('CustomCommandEditorContext: updateCommand() called before provider');
    },
    deleteCommand: () => {
      throw new Error('CustomCommandEditorContext: deleteCommand() called before provider');
    },
  },
]);

const fetchTemplates = async () => {
  const { data } = await makeRequest('/api/v1/templates', { schema: GetTemplatesResponse });

  return data.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
};

export const CustomCommandEditorProvider: ParentComponent = (props) => {
  const [socket] = useSocket();
  const [state, setState] = createStore({ ...defaultState });
  const [, { addNotification }] = useNotification();

  const [templates, { mutate: setTemplates }] = createResource(fetchTemplates, {
    initialValue: [],
  });

  const [template, setTemplate] = createSignal(state.command.templateId ?? 0);
  const [userLevel, setUserLevel] = createSignal(state.command.userLevel ?? UserLevel['Everyone']);

  createEffect(() => {
    setState({
      templates: templates(),
    });
  });

  const createTemplate = (template: Template) => {
    setTemplates((templates) => [...templates, template].sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    }));
  };

  const updateTemplate = (template: Template) => {
    setTemplates((templates) => templates.map((t) => t.id === template.id ? template : t));
  };

  const removeTemplate = (templateId: number) => {
    setTemplates((templates) => templates.filter((template) => template.id !== templateId));
  };

  const open = (command?: Partial<CustomCommand>) => {
    setState({
      open: true,
      command: command ?? {},
    });
  };

  const close = () => {
    setState({
      open: false,
      command: {},
    });
  };

  const createCommand = async (command: PostCustomCommandReqBody) => {
    const response = await fetch(`/api/v1/commands/custom`, {
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
        message: `An error occurred while creating command.`,
        duration: 10000,
      });
    }
  };

  const updateCommand = async (command: PatchCustomCommandReqBody) => {
    const response = await fetch(`/api/v1/commands/custom`, {
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
        message: `An error occurred while updating command.`,
        duration: 10000,
      });
    }
  };

  const deleteCommand = async (command: CustomCommand) => {
    const body: DeleteCustomCommandReqBody = {
      id: command.id,
    };

    const response = await fetch(`/api/v1/commands/custom`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'Command deleted',
        message: `The command ${command.command} was successfully deleted.`,
        duration: 5000,
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Command not deleted',
        message: `An error occurred while deleting the command ${command.command}.`,
        duration: 10000,
      });
    }
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
      await updateCommand({
        id: state.command.id,
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

  onMount(() => {
    socket.client.on('NEW_TEMPLATE', createTemplate);
    socket.client.on('UPD_TEMPLATE', updateTemplate);
    socket.client.on('DEL_TEMPLATE', removeTemplate);
  });

  onCleanup(() => {
    socket.client.off('NEW_TEMPLATE', createTemplate);
    socket.client.off('UPD_TEMPLATE', updateTemplate);
    socket.client.off('DEL_TEMPLATE', removeTemplate);
  });

  return (
    <CustomCommandEditorContext.Provider
      value={[
        state,
        {
          open,
          close,
          updateCommand,
          deleteCommand,
        },
      ]}
    >
      {props.children}

      <Portal>
        <Transition
          enterActiveClass={style.modalOpen}
          exitActiveClass={style.modalClose}
        >
          <Show when={state.open}>
            <div
              class={style.container}
              onClick={(ev) => {
                if (ev.target === ev.currentTarget) close();
              }}
            >
              <div class={style.modal}>
                <div class={style.titleBar}>
                  <span class={style.title}>Add command</span>

                  <TemplateButton onclick={() => close()}>
                    <MaterialSymbol symbol='close' color='gray' highlightColor='primary' interactive />
                  </TemplateButton>
                </div>

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
                          <For each={templates()}>
                            {(template) => (
                              <MenuItem value={template.id}>{template.name}</MenuItem>
                            )}
                          </For>
                        </Select>
                      </InputLabeled>
                    </FormControl>

                    <div class={style.description}>
                      This is your command template. You can add and edit templates in the Templates section.
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
                          <MenuItem value={UserLevel['Everyone']}>Everyone</MenuItem>
                          <MenuItem value={UserLevel['Subscriber']}>Subscriber</MenuItem>
                          <MenuItem value={UserLevel['VIP']}>VIP</MenuItem>
                          <MenuItem value={UserLevel['Moderator']}>Moderator</MenuItem>
                          <MenuItem value={UserLevel['Owner']}>Owner</MenuItem>
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
              </div>
            </div>
          </Show>
        </Transition>
      </Portal>
    </CustomCommandEditorContext.Provider>);
};

export const useCustomCommandEditor = (): CustomCommandEditorContextValue => useContext(CustomCommandEditorContext);
