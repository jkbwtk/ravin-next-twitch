import { ScheduledJob } from '#shared/types/api/admin';
import Cron, { CronOptions } from 'croner';
import { createHash } from 'crypto';


export type ExtendedCronOptions<T> = Exclude<CronOptions, 'context' | 'name'> & {
  name: string,
  context?: T
};

export type ExtendedCronCallback<T> = (self: ExtendedCron<T>, context: T) => void;

export class ExtendedCron<T = undefined> extends Cron {
  public creationTimestamp: number;
  public originalName: string;

  private static createEffects: ExtendedCronCallback<void>[] = [];
  private static runEffects: ExtendedCronCallback<void>[] = [];
  private static deleteEffects: ExtendedCronCallback<void>[] = [];

  constructor(pattern: string | Date, options: ExtendedCronOptions<T>, callback: ExtendedCronCallback<T>) {
    const creationTimestamp = performance.now();
    const originalName = options.name;

    const shortHash = ExtendedCron.hash(creationTimestamp, options.name, pattern.toString());
    options.name = [options.name, shortHash].join(':');

    super(pattern, options, ExtendedCron.callbackWrapper(callback));

    this.creationTimestamp = creationTimestamp;
    this.originalName = originalName;

    ExtendedCron.processCreateEffects(this);
  }

  private static hash(creationTimestamp: number, name: string, pattern?: string): string {
    const hash = createHash('md5');

    hash.update(name);
    hash.update(pattern ?? '');
    hash.update(creationTimestamp.toString());

    return hash.digest('hex').slice(0, 8);
  }

  private static callbackWrapper<T>(callback: ExtendedCronCallback<T>): ExtendedCronCallback<T> {
    return (self, ctx) => {
      callback(self, ctx);
      ExtendedCron.processRunEffects(self);
    };
  }

  private static processEffects(self: ExtendedCron<void>, effects: ExtendedCronCallback<void>[]): void {
    for (const effect of effects) {
      effect(self, undefined);
    }
  }

  private static processCreateEffects(self: ExtendedCron<void>) {
    ExtendedCron.processEffects(self, ExtendedCron.createEffects);
  }

  private static processRunEffects(self: ExtendedCron<void>) {
    ExtendedCron.processEffects(self, ExtendedCron.runEffects);
  }

  private static processDeleteEffects(self: ExtendedCron<void>) {
    ExtendedCron.processEffects(self, ExtendedCron.deleteEffects);
  }

  public static registerCreateEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.createEffects.push(effect);
  }

  public static unregisterCreateEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.createEffects = ExtendedCron.createEffects.filter((m) => m !== effect);
  }

  public static registerRunEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.runEffects.push(effect);
  }

  public static unregisterRunEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.runEffects = ExtendedCron.runEffects.filter((m) => m !== effect);
  }

  public static registerDeleteEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.deleteEffects.push(effect);
  }

  public static unregisterDeleteEffect(effect: ExtendedCronCallback<void>): void {
    ExtendedCron.deleteEffects = ExtendedCron.deleteEffects.filter((m) => m !== effect);
  }

  public static get scheduledJobs(): ExtendedCron[] {
    return Cron.scheduledJobs as ExtendedCron[];
  }

  public stop(): void {
    super.stop();
    ExtendedCron.processDeleteEffects(this);
  }

  public serialize(): ScheduledJob {
    const lastRun = this.currentRun();
    const nextRun = this.nextRun();
    const maxRuns = this.options.maxRuns ?? null;

    const job: ScheduledJob = {
      name: this.name!,
      originalName: this.originalName,
      cron: this.getPattern() ?? null,
      nextRun: nextRun ? nextRun.getTime() : null,
      lastRun: lastRun ? lastRun.getTime() : null,
      maxRuns: maxRuns === Infinity ? null : maxRuns,
      isRunning: this.isRunning(),
      isStopped: this.isStopped(),
      isBusy: this.isBusy(),
      creationTimestamp: this.creationTimestamp,
    };

    return job;
  }
}
