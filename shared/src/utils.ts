export type QuickSwitchKeyTypes = number | string;

export type QuickSwitchCases<T, K extends QuickSwitchKeyTypes> = Record<K, T> & { default: T };

export const quickSwitch = <T, K extends QuickSwitchKeyTypes = string>(value: QuickSwitchKeyTypes, cases: QuickSwitchCases<T, K>): T => {
  if (value in cases) {
    const option = cases[value as keyof typeof cases];
    if (option !== undefined) return option;
  }

  return cases.default;
};

type NonNull = string | number | boolean | symbol | object | bigint;

export const mergeOptions = <T extends Record<string, NonNull>>(options: Partial<T>, defaults: T): T => {
  const definedOptions = Object.entries(options)
    .filter(([, value]) => value !== undefined) as [keyof T, NonNull][];

  return Object.assign({}, defaults, Object.fromEntries(definedOptions));
};

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

export const arrayFrom = <T>(variable: T[] | T): T[] => {
  return Array.isArray(variable) ? variable.slice() : [variable];
};
