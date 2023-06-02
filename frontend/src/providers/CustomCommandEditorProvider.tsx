import { createContext, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { CustomCommand, DeleteCustomCommandRequest, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#shared/types/api/commands';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';
import TemplateButton from '#components/TemplateButton';
import MaterialSymbol from '#components/MaterialSymbol';
import { useNotification } from '#providers/NotificationProvider';
import InputRange from '#components/InputRange';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import TextArea from '#components/TextArea';
import Select from '#components/Select';
import Button from '#components/Button';

import style from '#styles/CustomCommandsEditorProvider.module.scss';


export const translateUserLevel = (userLevel: UserLevel): keyof typeof UserLevel => UserLevel[userLevel] as keyof typeof UserLevel;

export type CustomCommandEditorContextState = {
  open: boolean;
  command: Partial<CustomCommand>;
};

export type CustomCommandEditorContextValue = [
  state: CustomCommandEditorContextState,
  actions: {
    open: (command?: Partial<CustomCommand>) => void;
    close: () => void;

    updateCommand: (command: PatchCustomCommandRequest) => void;
    deleteCommand: (command: CustomCommand) => void;
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

    updateCommand: () => {
      throw new Error('CustomCommandEditorContext: updateCommand() called before provider');
    },
    deleteCommand: () => {
      throw new Error('CustomCommandEditorContext: deleteCommand() called before provider');
    },
  },
]);

export const CustomCommandEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore({ ...defaultState });
  const [, { addNotification }] = useNotification();

  const open = (command?: Partial<CustomCommand>) => {
    setState({
      open: true,
      command: command ?? {},
    });
  };

  const close = () => {
    setState(defaultState);
  };

  const createCommand = async (command: PostCustomCommandRequest) => {
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

  const updateCommand = async (command: PatchCustomCommandRequest) => {
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
    const body: DeleteCustomCommandRequest = {
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

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const command = ev.target.elements.namedItem('command') as HTMLInputElement;
    const response = ev.target.elements.namedItem('response') as HTMLTextAreaElement;
    const cooldown = ev.target.elements.namedItem('cooldown') as HTMLInputElement;
    const userLevel = ev.target.elements.namedItem('userLevel') as HTMLInputElement;

    if (state.command.id) {
      await updateCommand({
        id: state.command.id,
        command: command.value,
        response: response.value,
        cooldown: parseInt(cooldown.value),
        userLevel: parseInt(userLevel.value),
      });
    } else {
      await createCommand({
        command: command.value,
        response: response.value,
        cooldown: parseInt(cooldown.value),
        userLevel: parseInt(userLevel.value),
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
                    <InputLabeled label='Response' for='response'>
                      <TextArea
                        id='response'
                        name='response'
                        minLength={1}
                        maxLength={256}
                        placeholder='This is a command response.'
                        required
                        class={style.textarea}
                        value={state.command.response ?? ''}
                      />
                    </InputLabeled>

                    <div class={style.description}>
                      This is your command response. It can be up to 256 characters long.
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
                    <InputLabeled label='User level' for='userLevel'>
                      <Select id='userLevel' name='userLevel' class={style.select}>
                        <option
                          selected={(state.command.userLevel ?? UserLevel['Everyone']) === UserLevel['Everyone']}
                          value={UserLevel['Everyone']}
                        >
                        Everyone
                        </option>

                        <option
                          selected={state.command.userLevel === UserLevel['Subscriber']}
                          value={UserLevel['Subscriber']}
                        >
                        Subscriber
                        </option>

                        <option
                          selected={state.command.userLevel === UserLevel['VIP']}
                          value={UserLevel['VIP']}
                        >
                        VIP
                        </option>

                        <option
                          selected={state.command.userLevel === UserLevel['Moderator']}
                          value={UserLevel['Moderator']}
                        >
                        Moderator
                        </option>

                        <option
                          selected={state.command.userLevel === UserLevel['Owner']}
                          value={UserLevel['Owner']}
                        >
                        Owner
                        </option>
                      </Select>
                    </InputLabeled>

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
