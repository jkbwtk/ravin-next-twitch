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
