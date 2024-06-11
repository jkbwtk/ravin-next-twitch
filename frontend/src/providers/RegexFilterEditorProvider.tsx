import { batch, createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useNotification } from '#providers/NotificationProvider';
import InputRange from '#components/InputRange';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Button from '#components/Button';
import FormControl from '@suid/material/FormControl/FormControl';
import Select from '@suid/material/Select/Select';
import MenuItem from '@suid/material/MenuItem/MenuItem';
import Modal from '#components/Modal';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { SelectChangeEvent } from '@suid/material/Select';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';
import { Actions, DeleteRegexFilterReqBody, PatchRegexFilterReqBody, PostRegexFilterReqBody, RegexFilter } from '#types/api/filters';
import TextArea from '#components/TextArea';
import Input from '#components/Input';
import { RegExpType } from '#types/regExp';

import style from '#styles/CustomCommandsEditorProvider.module.scss';


export type RegexFilterEditorContextState = {
  open: boolean;
  filter: Partial<RegexFilter>;
};

export type RegexFilterEditorContextValue = [
  state: RegexFilterEditorContextState,
  actions: {
    open: (command?: Partial<RegexFilter>) => void;
    close: () => void;

    updateFilter: (timer: PatchRegexFilterReqBody) => void;
    removeFilter: (timer: RegexFilter) => void;
  }
];

export const defaultState: RegexFilterEditorContextState = {
  open: false,
  filter: {},
};

const RegexFilterEditorContext = createContext<RegexFilterEditorContextValue>([
  defaultState,
  {
    open: () => {
      throw new Error('RegexFilterEditorContext: open() called before provider');
    },
    close: () => {
      throw new Error('RegexFilterEditorContext: close() called before provider');
    },

    updateFilter: (): Promise<boolean> => {
      throw new Error('RegexFilterEditorContext: updateFilter() called before provider');
    },
    removeFilter: (): Promise<boolean> => {
      throw new Error('RegexFilterEditorContext: removeFilter() called before provider');
    },
  },
]);


export const RegexFilterEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();
  const { popupApiError } = useErrorHandlers();

  const [actionId, setActionId] = createSignal(Actions.Delete);

  const open = (filter?: Partial<RegexFilter>) => {
    batch(() => {
      setState({
        open: true,
        filter: filter ?? {},
      });
    });

    setActionId(filter?.action ?? Actions.Delete);
  };

  const close = () => {
    batch(() => {
      setState(structuredClone(defaultState));
      setActionId(Actions.Delete);
    });
  };

  const createFilter = async (filter: PostRegexFilterReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/regex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Regex filter not created',
        action: 'creating regex filter',
      });
    }

    return response.ok;
  };

  const updateFilter = async (filter: PatchRegexFilterReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/regex`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Regex filter not updated',
        action: 'updating regex filter',
      });
    }

    return response.ok;
  };

  const deleteFilter = async (filter: DeleteRegexFilterReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/regex`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Regex filter not deleted',
        action: 'deleting regex filter',
      });
    }

    return response.ok;
  };

  const removeFilter = async (filter: RegexFilter): Promise<boolean> => {
    const confirmed = await openConfirmationBox({
      title: 'Delete regex filter',
      message: 'Are you sure you want to delete this regex filter?',
      confirmText: 'Delete',
    });

    if (!confirmed) return false;

    const ok = await deleteFilter({
      id: filter.id,
    });

    if (ok) {
      addNotification({
        type: 'success',
        title: 'Regex filter deleted',
        message: `Regex filter was successfully deleted.`,
        duration: 5000,
      });
    }

    return ok;
  };

  const handleActionChange = (ev: SelectChangeEvent) => {
    setActionId(ev.target.value as unknown as Actions);
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const regexPattern = ev.target.elements.namedItem('regexPattern') as HTMLInputElement;
    const regexFlags = ev.target.elements.namedItem('regexFlags') as HTMLInputElement;
    const action = ev.target.elements.namedItem('action') as HTMLInputElement;
    const actionDuration = ev.target.elements.namedItem('actionDuration') as HTMLInputElement;
    const reason = ev.target.elements.namedItem('reason') as HTMLInputElement;


    const ok = state.filter.id ?
      await updateFilter({
        id: state.filter.id,
        regex: `/${regexPattern.value}/${regexFlags.value}`,
        action: parseInt(action.value),
        actionDuration: parseInt(actionDuration.value),
        reason: reason.value.length > 0 ? reason.value : null,
      }) :
      await createFilter({
        regex: `/${regexPattern.value}/${regexFlags.value}`,
        action: parseInt(action.value),
        actionDuration: parseInt(actionDuration.value),
        reason: reason.value.length > 0 ? reason.value : null,
        enabled: true,
      });

    if (ok) {
      const metadata = state.filter.id ? {
        title: 'Regex filter updated',
        message: `Regex filter was successfully updated.`,
      } : {
        title: 'Regex created',
        message: `Regex filter was successfully created.`,
      };

      addNotification({
        type: 'success',
        ...metadata,
        duration: 5000,
      });

      close();
    }
  };

  const convertedRegex = createMemo(() => RegExpType.safeParse(state.filter.regex ?? '').data);

  createEffect(() => {
    console.log(state.filter.regex, convertedRegex());
  });

  return (
    <RegexFilterEditorContext.Provider
      value={[
        state,
        {
          open,
          close,
          updateFilter: updateFilter,
          removeFilter: removeFilter,
        },
      ]}
    >
      {props.children}

      <Modal open={state.open} title='Add regex filter' onClose={() => close()}>
        <form class={style.form} onSubmit={handleForm}>
          <div class={style.group}>
            <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
              <InputLabeled label='Regex Pattern' for='regexPattern'>
                <InputBase
                  id='regexPattern'
                  name='regexPattern'
                  autocomplete='off'
                  required
                  minLength={1}
                  maxLength={64}
                  placeholder=''
                  value={convertedRegex()?.source ?? ''}
                  title='Regex must be between 1 and 64 characters long.'
                />
              </InputLabeled>

              <Input
                type='text'
                name='regexFlags'
                id='regexFlags'
                label='Regex Flags'
                autocomplete='off'
                placeholder='g'
                value={convertedRegex()?.flags ?? ''}
                style={{ width: '16.2rem', 'box-sizing': 'border-box' }}
              />
            </div>

            <div class={style.description}>
                      Regex pattern to be matched against the message.
            </div>
          </div>

          <div class={style.group}>
            <FormControl>
              <InputLabeled label='Action' for='action'>
                <Select
                  labelId='action-label'
                  id='action'
                  name='action'
                  value={actionId()}
                  onChange={handleActionChange}
                  required
                >
                  <MenuItem value={Actions.Delete}>Delete</MenuItem>
                  <MenuItem value={Actions.Timeout}>Timeout</MenuItem>
                  <MenuItem value={Actions.Ban}>Ban</MenuItem>
                </Select>
              </InputLabeled>
            </FormControl>

            <div class={style.description}>
                    Action to be performed when the filter is triggered.
            </div>
          </div>

          <div
            class={style.group}
            style={{ display: actionId() === Actions.Timeout ? 'initial' : 'none' }}
          >
            <InputLabeled label='Action duration' for='actionDuration'>
              <InputRange
                id='actionDuration'
                name='actionDuration'
                type='range'
                min='10'
                max='3600'
                step='10'
                label='Timeout duration:'
                unit='seconds'
                value={state.filter.actionDuration ?? '10'}
              />
            </InputLabeled>
          </div>

          <div class={style.group}>
            <InputLabeled label='Reason' for='reason'>
              <TextArea
                id='reason'
                name='reason'
                minLength={0}
                maxLength={1024}
                placeholder='This is a command response.'
                value={state.filter.reason ?? ''}
                class={style.textarea}
              />
            </InputLabeled>

            <div class={style.description}>
                    Reason why this filter exists.
            </div>
          </div>

          <div class={style.buttons}>
            <Button type='submit' color='primary' symbol='save'>Save</Button>
            <Button type='button' color='gray' onclick={() => close()}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </RegexFilterEditorContext.Provider>);
};

export const useRegexFilterEditor = (): RegexFilterEditorContextValue => useContext(RegexFilterEditorContext);
