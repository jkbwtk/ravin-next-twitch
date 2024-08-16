import Modal from '#components/Modal';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';
import { useNotification } from '#providers/NotificationProvider';
import {
  BehaviorProfileApi,
  GetAvailableRelatedItemsResponse,
  PatchBehaviorProfileReqBody,
  PostBehaviorProfileReqBody,
  SimpleRelatedItem,
} from '#types/api/behaviorProfiles';
import { batch, createContext, createEffect, createMemo, createResource, createSignal, For, onCleanup, onMount, Setter, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import InputLabeled from '#components/InputLabeled';
import InputBase from '#components/InputBase';
import Button from '#components/Button';
import { RegExpType } from '#types/regExp';
import Input from '#components/Input';
import TextArea from '#components/TextArea';
import { makeRequest } from '#lib/fetch';
import { ServerError } from '#shared/ServerError';
import { useSocket } from '#providers/SocketProvider';
import Pill from '#components/Pill';

import style from '#styles/BehaviorProfilesEditorProvider.module.scss';
import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';


export type BehaviorProfilesEditorContextState = {
  open: boolean;
  profile: Partial<BehaviorProfileApi>;
};

export type BehaviorProfilesEditorContextActions = {
  open: (profile?: Partial<BehaviorProfileApi>) => void;
  close: () => void;

  updateProfile: (id: number, profile: PatchBehaviorProfileReqBody) => Promise<boolean>;
  removeProfile: (profile: BehaviorProfileApi) => Promise<boolean>;
};

export type behaviorProfilesEditorContextValue = [
  state: BehaviorProfilesEditorContextState,
  actions: BehaviorProfilesEditorContextActions,
];

export const defaultState: BehaviorProfilesEditorContextState = {
  open: false,
  profile: {},
};

const BehaviorProfilesEditorContext = createContext<behaviorProfilesEditorContextValue>([
  defaultState,
  {
    open: () => {
      throw new Error('BehaviorProfilesEditorContext: open() called before provider');
    },
    close: () => {
      throw new Error('BehaviorProfilesEditorContext: close() called before provider');
    },

    updateProfile: () => {
      throw new Error('BehaviorProfilesEditorContext: updateProfile() called before provider');
    },
    removeProfile: () => {
      throw new Error('BehaviorProfilesEditorContext: removeProfile() called before provider');
    },
  },
]);

const fetchAvailableItems = async () => {
  const response = await makeRequest('/api/v1/behaviorProfiles/available-items', {
    schema: GetAvailableRelatedItemsResponse,
  });

  return response.data;
};

export const BehaviorProfilesEditorProvider: ParentComponent = (props) => {
  const [socket] = useSocket();
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();
  const { popupApiError } = useErrorHandlers();
  const [availableItems, { refetch: refetchAvailableItems }] = createResource(fetchAvailableItems, {
    initialValue: {
      commands: [],
      phraseFilters: [],
      regexFilters: [],
      commandTimers: [],
    },
    name: 'availableItems',
  });

  const titleActivatorRegex = createMemo(() => RegExpType.safeParse(state.profile.activatorTitle ?? '').data);
  const categoryActivatorRegex = createMemo(() => RegExpType.safeParse(state.profile.activatorCategory ?? '').data);

  const [pickedCustomCommands, setPickedCustomCommands] = createSignal<SimpleRelatedItem[]>([]);
  const [pickedPhraseFilters, setPickedPhraseFilters] = createSignal<SimpleRelatedItem[]>([]);
  const [pickedRegexFilters, setPickedRegexFilters] = createSignal<SimpleRelatedItem[]>([]);
  const [pickedCommandTimers, setPickedCommandTimers] = createSignal<SimpleRelatedItem[]>([]);

  const availableCustomCommands = createMemo(() => {
    const pickedIds = pickedCustomCommands().map((command) => command.id);
    return availableItems().commands.filter((command) => !pickedIds.includes(command.id));
  });

  const availablePhraseFilters = createMemo(() => {
    const pickedIds = pickedPhraseFilters().map((filter) => filter.id);
    return availableItems().phraseFilters.filter((filter) => !pickedIds.includes(filter.id));
  });

  const availableRegexFilters = createMemo(() => {
    const pickedIds = pickedRegexFilters().map((filter) => filter.id);
    return availableItems().regexFilters.filter((filter) => !pickedIds.includes(filter.id));
  });

  const availableCommandTimers = createMemo(() => {
    const pickedIds = pickedCommandTimers().map((timer) => timer.id);
    return availableItems().commandTimers.filter((timer) => !pickedIds.includes(timer.id));
  });

  createEffect((lastState) => {
    if (
      state.open &&
      lastState !== 'errored' &&
      availableItems.state === 'errored' &&
      availableItems.error instanceof ServerError
    ) {
      addNotification({
        type: 'error',
        title: 'Failed to fetch available items',
        message: availableItems.error.message,
        duration: 5000,
      });
    }

    if (state.open) {
      return availableItems.state;
    } else return null;
  });

  const updateAvailableItems = () => {
    refetchAvailableItems();
  };

  onMount(() => {
    socket.client.on('NEW_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.on('NEW_PHRASE_FILTER', updateAvailableItems);
    socket.client.on('NEW_REGEX_FILTER', updateAvailableItems);
    socket.client.on('NEW_COMMAND_TIMER', updateAvailableItems);

    socket.client.on('UPD_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.on('UPD_PHRASE_FILTER', updateAvailableItems);
    socket.client.on('UPD_REGEX_FILTER', updateAvailableItems);
    socket.client.on('UPD_COMMAND_TIMER', updateAvailableItems);

    socket.client.on('DEL_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.on('DEL_PHRASE_FILTER', updateAvailableItems);
    socket.client.on('DEL_REGEX_FILTER', updateAvailableItems);
    socket.client.on('DEL_COMMAND_TIMER', updateAvailableItems);
  });

  onCleanup(() => {
    socket.client.off('NEW_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.off('NEW_PHRASE_FILTER', updateAvailableItems);
    socket.client.off('NEW_REGEX_FILTER', updateAvailableItems);
    socket.client.off('NEW_COMMAND_TIMER', updateAvailableItems);

    socket.client.off('UPD_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.off('UPD_PHRASE_FILTER', updateAvailableItems);
    socket.client.off('UPD_REGEX_FILTER', updateAvailableItems);
    socket.client.off('UPD_COMMAND_TIMER', updateAvailableItems);

    socket.client.off('DEL_CUSTOM_COMMAND', updateAvailableItems);
    socket.client.off('DEL_PHRASE_FILTER', updateAvailableItems);
    socket.client.off('DEL_REGEX_FILTER', updateAvailableItems);
    socket.client.off('DEL_COMMAND_TIMER', updateAvailableItems);
  });

  const open: BehaviorProfilesEditorContextActions['open'] = (profile) => {
    batch(() => {
      setState('open', true);
      setState('profile', profile || {});

      setPickedCustomCommands(profile?.commands?.map((command) => ({ id: command.id, name: command.command })) ?? []);
      setPickedPhraseFilters(profile?.phraseFilters?.map((filter) => ({ id: filter.id, name: filter.phrase })) ?? []);
      setPickedRegexFilters(profile?.regexFilters?.map((filter) => ({ id: filter.id, name: filter.regex })) ?? []);
      setPickedCommandTimers(profile?.commandTimers?.map((timer) => ({ id: timer.id, name: timer.name })) ?? []);
    });
  };

  const close: BehaviorProfilesEditorContextActions['close'] = () => {
    setState(structuredClone(defaultState));
  };

  const createProfile = async (profile: PostBehaviorProfileReqBody): Promise<boolean> => {
    const response = await fetch('/api/v1/behaviorProfiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Behavior profile not created',
        action: 'creating behavior profile',
      });
    }

    return response.ok;
  };

  const updateProfile: BehaviorProfilesEditorContextActions['updateProfile'] = async (id, profile) => {
    const response = await fetch(`/api/v1/behaviorProfiles/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Behavior profile not updated',
        action: 'updating behavior profile',
      });
    }

    return response.ok;
  };

  const deleteProfile = async (id: number): Promise<boolean> => {
    const response = await fetch(`/api/v1/behaviorProfiles/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      popupApiError(response, {
        title: 'Behavior profile not deleted',
        action: 'deleting behavior profile',
      });
    }

    return response.ok;
  };

  const removeProfile: BehaviorProfilesEditorContextActions['removeProfile'] = async (profile) => {
    const confirmed = await openConfirmationBox({
      title: 'Delete behavior profile',
      message: 'Are you sure you want to delete this behavior profile?',
      confirmText: 'Delete',
    });

    if (!confirmed) return false;

    const ok = await deleteProfile(profile.id);

    if (ok) {
      addNotification({
        type: 'success',
        title: 'Behavior profile deleted',
        message: `Behavior profile was successfully deleted.`,
        duration: 5000,
      });
    }

    return ok;
  };

  const addRelatedItem = (item: SimpleRelatedItem, setter: Setter<SimpleRelatedItem[]>) => {
    setter((prev) => [...prev, item]);
  };

  const removeRelatedItem = (item: SimpleRelatedItem, setter: Setter<SimpleRelatedItem[]>) => {
    setter((prev) => prev.filter((prevItem) => prevItem.id !== item.id));
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const name = ev.target.elements.namedItem('name') as HTMLInputElement;
    const activatorTitle = ev.target.elements.namedItem('activatorTitle') as HTMLInputElement;
    const activatorTitleFlags = ev.target.elements.namedItem('activatorTitleFlags') as HTMLInputElement;
    const activatorCategory = ev.target.elements.namedItem('activatorCategory') as HTMLInputElement;
    const activatorCategoryFlags = ev.target.elements.namedItem('activatorCategoryFlags') as HTMLInputElement;
    const description = ev.target.elements.namedItem('description') as HTMLInputElement;

    const profile: PostBehaviorProfileReqBody = {
      name: name.value,
      activatorTitle: activatorTitle.value.length ? `/${activatorTitle.value}/${activatorTitleFlags.value}` : null,
      activatorCategory: activatorCategory.value.length ? `/${activatorCategory.value}/${activatorCategoryFlags.value}` : null,
      description: description.value,

      commands: pickedCustomCommands().map((command) => command.id),
      phraseFilters: pickedPhraseFilters().map((filter) => filter.id),
      regexFilters: pickedRegexFilters().map((filter) => filter.id),
      commandTimers: pickedCommandTimers().map((timer) => timer.id),

      enabled: state.profile.enabled ?? true,
      manuallyActivated: state.profile.manuallyActivated ?? false,
    };

    const ok = state.profile.id ?
      await updateProfile(state.profile.id, profile) : await createProfile(profile);

    if (ok) {
      const metadata = state.profile.id ? {
        title: 'Behavior profile updated',
        message: 'Behavior profile was successfully updated.',
      } : {
        title: 'Behavior profile created',
        message: 'Behavior profile was successfully created.',
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
    <BehaviorProfilesEditorContext.Provider value={[
      state, {
        open,
        close,
        updateProfile,
        removeProfile,
      }]}>
      {props.children}

      <Modal modalClass={style.modal} open={state.open} title='Add behavior profile' onClose={() => close()}>
        <div class={style.formContainer}>
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
                  placeholder='My profile'
                  value={state.profile.name ?? ''}
                />
              </InputLabeled>

              <div class={style.description}>
              Name of the profile. It must be between 1 and 32 characters long.
              </div>
            </div>

            <div class={style.group}>
              <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
                <InputLabeled label='Title Activator Regex Pattern' for='activatorTitle'>
                  <InputBase
                    id='activatorTitle'
                    name='activatorTitle'
                    autocomplete='off'
                    minLength={1}
                    maxLength={64}
                    value={titleActivatorRegex()?.source ?? ''}
                    title='Regex must be between 1 and 64 characters long.'
                  />
                </InputLabeled>

                <Input
                  type='text'
                  name='activatorTitleFlags'
                  id='activatorTitleFlags'
                  label='Regex Flags'
                  autocomplete='off'
                  placeholder='g'
                  value={titleActivatorRegex()?.flags ?? ''}
                  style={{ width: '16.2rem', 'box-sizing': 'border-box' }}
                />
              </div>

              <div class={style.description}>
              Regex pattern that when matched in a title will activate this profile.
              </div>
            </div>

            <div class={style.group}>
              <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
                <InputLabeled label='Category Activator Regex Pattern' for='activatorCategory'>
                  <InputBase
                    id='activatorCategory'
                    name='activatorCategory'
                    autocomplete='off'
                    minLength={1}
                    maxLength={64}
                    placeholder=''
                    value={categoryActivatorRegex()?.source ?? ''}
                  />
                </InputLabeled>

                <Input
                  type='text'
                  name='activatorCategoryFlags'
                  id='activatorCategoryFlags'
                  label='Regex Flags'
                  autocomplete='off'
                  placeholder='g'
                  value={categoryActivatorRegex()?.flags ?? ''}
                  style={{ width: '16.2rem', 'box-sizing': 'border-box' }}
                />
              </div>

              <div class={style.description}>
              Regex pattern that when matched in a category will activate this profile.
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Custom Commands</label>

              <div class={style.pillContainer}>
                <For each={pickedCustomCommands()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(command) => (
                    <Pill content={command.name} icon={
                      <TemplateButton onClick={() => removeRelatedItem(command, setPickedCustomCommands)}>
                        <MaterialSymbol symbol='remove' size='small' interactive color='red'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>

              <div class={style.description}>
              List of commands that will be available in this profile.
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Phrase Filters</label>

              <div class={style.pillContainer}>
                <For each={pickedPhraseFilters()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(filter) => (
                    <Pill content={filter.name} icon={
                      <TemplateButton onClick={() => removeRelatedItem(filter, setPickedPhraseFilters)}>
                        <MaterialSymbol symbol='remove' size='small' interactive color='red'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>

              <div class={style.description}>
              List of phrase filters that will be available in this profile.
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Regex Filters</label>

              <div class={style.pillContainer}>
                <For each={pickedRegexFilters()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(filter) => (
                    <Pill content={filter.name} icon={
                      <TemplateButton onClick={() => removeRelatedItem(filter, setPickedRegexFilters)}>
                        <MaterialSymbol symbol='remove' size='small' interactive color='red'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>

              <div class={style.description}>
              List of regex filters that will be available in this profile.
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Command Timers</label>

              <div class={style.pillContainer}>
                <For each={pickedCommandTimers()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(timer) => (
                    <Pill content={timer.name} icon={
                      <TemplateButton onClick={() => removeRelatedItem(timer, setPickedCommandTimers)}>
                        <MaterialSymbol symbol='remove' size='small' interactive color='red'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>

              <div class={style.description}>
              List of command timers that will be available in this profile.
              </div>
            </div>

            <div class={style.group}>
              <InputLabeled label='Description' for='description'>
                <TextArea
                  id='description'
                  name='reason'
                  minLength={3}
                  maxLength={1024}
                  required
                  placeholder='Some profile description'
                  value={state.profile.description ?? ''}
                  class={style.textarea}
                />
              </InputLabeled>

              <div class={style.description}>
              Profile description. It must be between 3 and 1024 characters long.
              </div>
            </div>

            <div class={style.buttons}>
              <Button type='submit' color='primary' symbol='save'>Save</Button>
              <Button type='button' color='gray' onclick={() => close()}>Cancel</Button>
            </div>
          </form>

          <div class={style.relatedItemContainer}>
            <div class={style.group}>
              <label class={style.label}>Available Custom Commands</label>

              <div class={style.items}>
                <For each={availableCustomCommands()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(command) => (
                    <Pill content={command.name} icon={
                      <TemplateButton onClick={() => addRelatedItem(command, setPickedCustomCommands)}>
                        <MaterialSymbol symbol='add' size='small' interactive color='green'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Available Phrase Filters</label>

              <div class={style.items}>
                <For each={availablePhraseFilters()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(filter) => (
                    <Pill content={filter.name} icon={
                      <TemplateButton onClick={() => addRelatedItem(filter, setPickedPhraseFilters)}>
                        <MaterialSymbol symbol='add' size='small' interactive color='green'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Available Regex Filters</label>

              <div class={style.items}>
                <For each={availableRegexFilters()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(filter) => (
                    <Pill content={filter.name} icon={
                      <TemplateButton onClick={() => addRelatedItem(filter, setPickedRegexFilters)}>
                        <MaterialSymbol symbol='add' size='small' interactive color='green'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>
            </div>

            <div class={style.group}>
              <label class={style.label}>Available Command Timers</label>

              <div class={style.items}>
                <For each={availableCommandTimers()} fallback={
                  <span class={style.emptyList}>No items...</span>
                }>
                  {(timer) => (
                    <Pill content={timer.name} icon={
                      <TemplateButton onClick={() => addRelatedItem(timer, setPickedCommandTimers)}>
                        <MaterialSymbol symbol='add' size='small' interactive color='green'/>
                      </TemplateButton>
                    } />
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </BehaviorProfilesEditorContext.Provider>
  );
};

export const useBehaviorProfilesEditor = (): behaviorProfilesEditorContextValue => useContext(BehaviorProfilesEditorContext);
