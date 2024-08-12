import Modal from '#components/Modal';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';
import { useNotification } from '#providers/NotificationProvider';
import { BehaviorProfileApi, PatchBehaviorProfileReqBody, PostBehaviorProfileReqBody } from '#types/api/behaviorProfiles';
import { batch, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';


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

export const BehaviorProfilesEditorProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const [, { addNotification }] = useNotification();
  const { open: openConfirmationBox } = useConfirmationBox();
  const { popupApiError } = useErrorHandlers();

  const open: BehaviorProfilesEditorContextActions['open'] = (profile) => {
    batch(() => {
      setState('open', true);
      setState('profile', profile || {});
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

  return (
    <BehaviorProfilesEditorContext.Provider value={[
      state, {
        open,
        close,
        updateProfile,
        removeProfile,
      }]}>
      {props.children}

      <Modal open={state.open} title='Add behavior profile' onClose={() => close()}>
        TEST
      </Modal>
    </BehaviorProfilesEditorContext.Provider>
  );
};

export const useBehaviorProfilesEditor = (): behaviorProfilesEditorContextValue => useContext(BehaviorProfilesEditorContext);
