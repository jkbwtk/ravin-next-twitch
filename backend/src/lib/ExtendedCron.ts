import { ScheduledJob } from '#shared/types/api/admin';
import Cron, { CronOptions } from 'croner';
import { createHash } from 'crypto';


export type ExtendedCronOptions<T> = Exclude<CronOptions, 'context' | 'name'> & {
  name: string,
  context?: T
};

export type ExtendedCronCallback<T> = (self: ExtendedCron<T>, context: T) => void;
export type ExtendedCronEffectCallback = (self: ExtendedCron<void>) => void;

export type ExtendedCronEffect = 'create' | 'run' | 'delete';

export class ExtendedCron<T = undefined> extends Cron {
  public creationTimestamp: number;
  public originalName: string;

  private static readonly effects: Record<ExtendedCronEffect, Set<ExtendedCronEffectCallback>> = {
    create: new Set(),
    run: new Set(),
    delete: new Set(),
  };

  constructor(pattern: string | Date, options: ExtendedCronOptions<T>, callback: ExtendedCronCallback<T>) {
    const creationTimestamp = performance.now();
    const originalName = options.name;

    const shortHash = ExtendedCron.hash(creationTimestamp, options.name, pattern.toString());
    options.name = [options.name, shortHash].join(':');

    super(pattern, options, ExtendedCron.callbackWrapper(callback));

    this.creationTimestamp = creationTimestamp;
    this.originalName = originalName;

    ExtendedCron.emitEffect('create', this);
  }

  public stop(): void {
    super.stop();
    ExtendedCron.emitEffect('delete', this);
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
      ExtendedCron.emitEffect('run', self);
    };
  }

  private static emitEffect(effect: ExtendedCronEffect, self: ExtendedCron<void>): void {
    const callbacks = ExtendedCron.effects[effect];

    for (const callback of callbacks) {
      callback(self);
    }
  }

  public static registerEffect(effect: ExtendedCronEffect, callback: ExtendedCronEffectCallback): void {
    ExtendedCron.effects[effect].add(callback);
  }

  public static unregisterEffect(effect: ExtendedCronEffect, callback: ExtendedCronEffectCallback): boolean {
    return ExtendedCron.effects[effect].delete(callback);
  }

  public static get scheduledJobs(): ExtendedCron[] {
    return Cron.scheduledJobs as ExtendedCron[];
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
