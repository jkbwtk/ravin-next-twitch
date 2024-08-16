import { batch, createContext, createSignal, useContext } from 'solid-js';
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
import InputCheckbox from '#components/InputCheckbox';
import { Actions, PatchPhraseFilterReqBody, PhraseFilterApi, PostPhraseFilterReqBody } from '#types/api/filters';
import TextArea from '#components/TextArea';

import style from '#styles/EditorProvider.module.scss';


export type PhraseFilterEditorContextState = {
  open: boolean;
  filter: Partial<PhraseFilterApi>;
};

export type PhraseFilterEditorContextValue = [
  state: PhraseFilterEditorContextState,
  actions: {
    open: (command?: Partial<PhraseFilterApi>) => void;
    close: () => void;

    updateFilter: (id: number, timer: PatchPhraseFilterReqBody) => void;
    removeFilter: (timer: PhraseFilterApi) => void;
  }
];

export const defaultState: PhraseFilterEditorContextState = {
  open: false,
  filter: {},
};

const PhraseFilterEditorContext = createContext<PhraseFilterEditorContextValue>([
  defaultState,
  {
    open: () => {
      throw new Error('PhraseFilterEditorContext: open() called before provider');
    },
    close: () => {
      throw new Error('PhraseFilterEditorContext: close() called before provider');
    },

    updateFilter: (): Promise<boolean> => {
      throw new Error('PhraseFilterEditorContext: updateFilter() called before provider');
    },
    removeFilter: (): Promise<boolean> => {
      throw new Error('PhraseFilterEditorContext: removeFilter() called before provider');
    },
  },
]);


export const PhraseFilterEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();
  const { popupApiError } = useErrorHandlers();

  const [actionId, setActionId] = createSignal(Actions.Delete);

  const open = (filter?: Partial<PhraseFilterApi>) => {
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

  const createFilter = async (filter: PostPhraseFilterReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/phrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Phrase filter not created',
        action: 'creating phrase filter',
      });
    }

    return response.ok;
  };

  const updateFilter = async (id: number, filter: PatchPhraseFilterReqBody): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/phrase/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Phrase filter not updated',
        action: 'updating phrase filter',
      });
    }

    return response.ok;
  };

  const deleteFilter = async (id: number): Promise<boolean> => {
    const response = await fetch(`/api/v1/filters/phrase/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Phrase filter not deleted',
        action: 'deleting phrase filter',
      });
    }

    return response.ok;
  };

  const removeFilter = async (filter: PhraseFilterApi): Promise<boolean> => {
    const confirmed = await openConfirmationBox({
      title: 'Delete phrase filter',
      message: 'Are you sure you want to delete this phrase filter?',
      confirmText: 'Delete',
    });

    if (!confirmed) return false;

    const ok = await deleteFilter(filter.id);

    if (ok) {
      addNotification({
        type: 'success',
        title: 'Phrase filter deleted',
        message: `Phrase filter was successfully deleted.`,
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

    const phrase = ev.target.elements.namedItem('phrase') as HTMLInputElement;
    const caseSensitive = ev.target.elements.namedItem('caseSensitive') as HTMLInputElement;
    const ignoreWhitespace = ev.target.elements.namedItem('ignoreWhitespace') as HTMLInputElement;
    const similarity = ev.target.elements.namedItem('similarity') as HTMLInputElement;
    const action = ev.target.elements.namedItem('action') as HTMLInputElement;
    const actionDuration = ev.target.elements.namedItem('actionDuration') as HTMLInputElement;
    const reason = ev.target.elements.namedItem('reason') as HTMLInputElement;


    const ok = state.filter.id ?
      await updateFilter(state.filter.id, {
        phrase: phrase.value,
        caseSensitive: caseSensitive.checked,
        ignoreWhitespace: ignoreWhitespace.checked,
        similarity: parseInt(similarity.value),
        action: parseInt(action.value),
        actionDuration: parseInt(actionDuration.value),
        reason: reason.value.length > 0 ? reason.value : null,
      }) :
      await createFilter({
        phrase: phrase.value,
        caseSensitive: caseSensitive.checked,
        ignoreWhitespace: ignoreWhitespace.checked,
        similarity: parseInt(similarity.value),
        action: parseInt(action.value),
        actionDuration: parseInt(actionDuration.value),
        reason: reason.value.length > 0 ? reason.value : null,
        enabled: true,
      });

    if (ok) {
      const metadata = state.filter.id ? {
        title: 'Phrase filter updated',
        message: `Phrase filter was successfully updated.`,
      } : {
        title: 'Phrase created',
        message: `Phrase filter was successfully created.`,
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
    <PhraseFilterEditorContext.Provider
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

      <Modal open={state.open} title='Add phrase filter' onClose={() => close()}>
        <form class={style.form} onSubmit={handleForm}>
          <div class={style.group}>
            <InputLabeled label='Phrase' for='phrase'>
              <InputBase
                id='phrase'
                name='phrase'
                autocomplete='off'
                required
                minLength={1}
                maxLength={64}
                placeholder='i hate cookies'
                value={state.filter.phrase ?? ''}
                title='Phrase must be between 1 and 64 characters long.'
              />
            </InputLabeled>

            <div class={style.description}>
                      Phrase that will trigger the filter.
            </div>
          </div>

          <div class={style.group}>
            <InputCheckbox
              id='caseSensitive'
              name='caseSensitive'
              label='Case sensitive'
              checked={state.filter.caseSensitive ?? false}
            />

            <div class={style.description}>
                      Controls whether the phrase is case sensitive.
            </div>
          </div>

          <div class={style.group}>
            <InputCheckbox
              id='ignoreWhitespace'
              name='ignoreWhitespace'
              label='Ignore Whitespace'
              checked={state.filter.ignoreWhitespace ?? false}
            />

            <div class={style.description}>
                      Controls whether whitespace is ignored when comparing the phrase.
            </div>
          </div>

          <div class={style.group}>
            <InputLabeled label='Similarity factor' for='similarity'>
              <InputRange
                id='similarity'
                name='similarity'
                type='range'
                min='0'
                max='100'
                step='1'
                label='Similarity factor:'
                unit='%'
                value={state.filter.similarity ?? '100'}
              />
            </InputLabeled>

            <div class={style.description}>
                      Controls similarity factor required to trigger the filter.
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
                placeholder='Spam filtering'
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
    </PhraseFilterEditorContext.Provider>);
};

export const usePhraseFilterEditor = (): PhraseFilterEditorContextValue => useContext(PhraseFilterEditorContext);
