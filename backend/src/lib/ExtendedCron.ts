import { logger } from '#lib/logger';
import { ScheduledJob } from '#shared/types/api/admin';
import { quickSwitch } from '#shared/utils';
import Cron, { CronOptions } from 'croner';
import { createHash } from 'crypto';


export type ExtendedCronOptions<T> = Exclude<CronOptions, 'context' | 'name'> & {
  name: string,
  context?: T
};

export type ExtendedCronCallback<T> = (self: ExtendedCron<T>, context: T) => void;
export type ExtendedCronEffectCallback = (self: ExtendedCron<void>) => void;

export type ExtendedCronEffect = 'create' | 'run' | 'delete' | 'pause' | 'resume';

export class ExtendedCron<T = undefined> extends Cron {
  public creationTimestamp: number;
  public originalName: string;

  public pausedReason?: string;
  public resumedReason?: string;

  private static readonly effects: Record<ExtendedCronEffect, Set<ExtendedCronEffectCallback>> = {
    create: new Set(),
    run: new Set(),
    delete: new Set(),
    pause: new Set(),
    resume: new Set(),
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

  public resume(reason?: string): boolean {
    const resp = super.resume();

    ExtendedCron.emitEffect('resume', this);
    this.resumedReason = reason;

    return resp;
  }

  public pause(reason?: string): boolean {
    const resp = super.pause();

    ExtendedCron.emitEffect('pause', this);
    this.pausedReason = reason;

    return resp;
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

    let message = 'Emitting effect [%s]';
    let reason = quickSwitch(effect, {
      pause: self.pausedReason,
      resume: self.resumedReason,
      default: undefined,
    });

    if (reason !== undefined) {
      message += ', reason: [%s]';
    }

    logger.debug(message, effect, reason, {
      label: ['ExtendedCron', self.name],
    });

    for (const callback of callbacks) {
      callback(self);
    }
  }

  public static registerEffect(effect: ExtendedCronEffect, callback: ExtendedCronEffectCallback): void {
    ExtendedCron.effects[effect].add(callback);

    logger.debug('Registered effect [%s]', effect, {
      label: 'ExtendedCron',
    });
  }

  public static unregisterEffect(effect: ExtendedCronEffect, callback: ExtendedCronEffectCallback): boolean {
    const resp = ExtendedCron.effects[effect].delete(callback);

    logger.debug('Unregistered effect [%s]', effect, {
      label: 'ExtendedCron',
    });

    return resp;
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
      pausedReason: this.pausedReason ?? null,
    };

    return job;
  }
}
