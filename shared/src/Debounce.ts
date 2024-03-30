import { mergeOptions, RequiredDefaults } from './utils';


export type DebounceOptions<T> = {
  timeout?: number;

  callback: (value: T) => void;
};

export class Debounce<T = void> {
  private timeout: NodeJS.Timeout | number | null = null;

  private options: Required<DebounceOptions<T>>;

  public static defaultOptions: RequiredDefaults<DebounceOptions<unknown>> = {
    timeout: 500,
  };

  constructor(options: DebounceOptions<T>) {
    this.options = mergeOptions(options, Debounce.defaultOptions);
  }

  public debounce = (value: T): void => {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.options.callback(value);
    }, this.options.timeout);
  };
}
