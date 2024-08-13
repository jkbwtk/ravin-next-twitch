export type Signal<T> = {
  (): T,
  get: () => T,
  set: (value: T) => void,
  reset: () => void,
  subscribe: (listener: (value: T) => void) => void,
  unsubscribe: (listener: (value: T) => void) => void,
};

export type SignalListener<T> = (value: T) => void;

export const basicSignal = <T>(defaultValue: T): Signal<T> => {
  let value = defaultValue;
  const listeners = new Set<(value: T) => void>();

  const signal = () => {
    return value;
  };

  signal.get = () => {
    return value;
  };

  signal.set = (newValue: T) => {
    value = newValue;

    for (const listener of listeners) {
      listener(value);
    }
  };

  signal.reset = () => {
    signal.set(defaultValue);
  };

  signal.subscribe = (listener: (value: T) => void) => {
    listeners.add(listener);
  };

  signal.unsubscribe = (listener: (value: T) => void) => {
    listeners.delete(listener);
  };

  return signal;
};
