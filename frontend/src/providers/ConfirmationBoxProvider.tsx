import Button from '#components/Button';
import Modal from '#components/Modal';
import Deferred from '#shared/Deferred';
import { batch, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import style from '#styles/ConfirmationBoxProvider.module.scss';


export type ConfirmationBoxOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export type ConfirmationBoxOpenRequest = {
  options: ConfirmationBoxOptions;
  resolve: (value: boolean | PromiseLike<boolean>) => void;
};

export type ConfirmationBoxContextState = {
  open: boolean;
  options: ConfirmationBoxOptions;
};

export type ConfirmationBoxContextValue = {
  open: (options: ConfirmationBoxOptions) => Promise<boolean>;
  close: (signal: boolean) => void;
};


const defaultState: ConfirmationBoxContextState = {
  open: false,
  options: {
    title: 'Confirmation Box',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  },
};

const ConfirmationBoxContext = createContext<ConfirmationBoxContextValue>({
  open: () => {
    throw new Error('ConfirmationBoxContext: open() called before provider');
  },
  close: () => {
    throw new Error('ConfirmationBoxContext: close() called before provider');
  },
});

export const ConfirmationBoxProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(structuredClone(defaultState));
  const queue: ConfirmationBoxOpenRequest[] = [];
  let resolve: (value: boolean | PromiseLike<boolean>) => void = () => {};

  const open = (options: ConfirmationBoxOptions) => {
    const deferred = new Deferred<boolean>();
    const realOptions: ConfirmationBoxOptions = { ...defaultState.options, ...options };

    batch(() => {
      if (state.open) {
        queue.push({ options: realOptions, resolve: deferred.resolve });
      } else {
        resolve = deferred.resolve;

        setState('open', true);
        setState('options', realOptions);
      }
    });


    return deferred.promise;
  };

  const close = (signal: boolean) => {
    resolve(signal);

    if (queue.length === 0) {
      setState('open', false);
    } else {
      const request = queue.shift()!;
      const realOptions: ConfirmationBoxOptions = { ...defaultState.options, ...request.options };

      resolve = request.resolve;

      setState('options', realOptions);
    }
  };

  return (
    <ConfirmationBoxContext.Provider value={{ open, close }}>
      {props.children}

      <Modal title={state.options.title} open={state.open} onClose={() => close(false)} modalClass={style.confirmationBox}>
        <div class={style.container}>
          <span class={style.message}>{state.options.message}</span>
          <div class={style.buttonContainer}>
            <Button onClick={() => close(false)}>{state.options.cancelText}</Button>
            <Button onClick={() => close(true)} color='primary'>{state.options.confirmText}</Button>
          </div>
        </div>
      </Modal>
    </ConfirmationBoxContext.Provider>
  );
};

export const useConfirmationBox = (): ConfirmationBoxContextValue => useContext(ConfirmationBoxContext);
