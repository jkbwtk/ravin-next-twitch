import Cron, { CronOptions } from 'croner';


export type ExtendedCronOptions<T> = Exclude<CronOptions, 'context' | 'name'> & {
  name: string,
  context?: T
};

export type ExtendedCronCallback<T> = (self: ExtendedCron<T>, context: T) => void;

export class ExtendedCron<T = undefined> extends Cron {
  private static effects: ExtendedCronCallback<void>[] = [];

  constructor(pattern: string | Date, options: ExtendedCronOptions<T>, callback: ExtendedCronCallback<T>) {
    super(pattern, options, ExtendedCron.callbackWrapper(callback));
  }

  private static callbackWrapper<T>(callback: ExtendedCronCallback<T>): ExtendedCronCallback<T> {
    return (self, ctx) => {
      callback(self, ctx);
      ExtendedCron.processEffects(self);
    };
  }

  private static processEffects(self: ExtendedCron<void>) {
    for (const effect of ExtendedCron.effects) {
      effect(self, undefined);
    }
  }

  public static registerEffect(middleware: ExtendedCronCallback<void>): void {
    ExtendedCron.effects.push(middleware);
  }

  public static unregisterEffect(middleware: ExtendedCronCallback<void>): void {
    ExtendedCron.effects = ExtendedCron.effects.filter((m) => m !== middleware);
  }
}
