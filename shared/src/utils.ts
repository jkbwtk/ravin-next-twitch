export type QuickSwitchKeyTypes = number | string;

export type QuickSwitchCases<T, K extends QuickSwitchKeyTypes> = Record<K, T> & { default: T };

export const quickSwitch = <T, K extends QuickSwitchKeyTypes = string>(value: QuickSwitchKeyTypes, cases: QuickSwitchCases<T, K>): T => {
  if (value in cases) {
    const option = cases[value as keyof typeof cases];
    if (option !== undefined) return option;
  }

  return cases.default;
};

type Defined = string | number | boolean | symbol | object | bigint | null;

export const mergeOptions = <T extends Record<string, Defined>>(options: T, defaults: RequiredDefaults<T> | Required<T>): Required<T> => {
  const definedOptions = Object.entries(options)
    .filter(([, value]) => value !== undefined) as [keyof T, Defined][];

  return Object.assign({}, defaults, Object.fromEntries(definedOptions)) as Required<T>;
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

// https://stackoverflow.com/questions/57593022/reverse-required-and-optional-properties
type OptionalKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T];

export type RequiredDefaults<T extends Record<string, unknown>> = Required<Pick<T, OptionalKeys<T>>>;

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
